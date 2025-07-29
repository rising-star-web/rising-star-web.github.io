// success.js
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    const loadingSpinner = document.getElementById('loadingSpinner');
    const successIcon = document.getElementById('successIcon');
    const errorIcon = document.getElementById('errorIcon');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    const backButton = document.getElementById('backButton');
    
    const baseUrl = "https://backend4.sharemyworks.com/api/";
    //const baseUrl = 'http://localhost:3000/api/';

    function updateUI(state, title, message) {
      loadingSpinner.style.display = state === 'loading' ? 'block' : 'none';
      successIcon.style.display = state === 'success' ? 'block' : 'none';
      errorIcon.style.display = state === 'error' ? 'block' : 'none';
      statusTitle.textContent = title;
      statusMessage.textContent = message;
      if (backButton) {
        backButton.style.display = state === 'loading' ? 'none' : 'block';
      }
    }

    async function verifyStripeSession(sessionId) {
      const response = await fetch(`${baseUrl}Checkouts/verify-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          branchId: 'sandiego',
          sessionId: sessionId
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to verify session');
      }
  
      const result = await response.json();
      if (result.status !== 'paid') {
        throw new Error('Payment not complete');
      }
  
      return result;
    }


    // Update trial class comment with payment confirmation
    async function updateTrialClassPayment(trialClassId, sessionId) {
      const updateData = {
        comment: `Paid, transaction id: ${sessionId}`
      };

      var formBody = [];
      for (var property in updateData) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(updateData[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      const response = await fetch(`${baseUrl}TrialClasses/${trialClassId}`, {
        mode: "cors",
        method: "PATCH",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
      });

      if (!response.ok) {
        throw new Error('Failed to update trial class payment status');
      }

      return await response.json();
    }

    // Handle add student to course through SIGNUP
    async function handleRegistration(registrationInfo) {
      // Create account
      const registerData = {
        ...registrationInfo.registerData,
        username: `${registrationInfo.registerData.username}${Math.floor(Math.random() * 900 + 100)}`
      };

      const response = await fetch(`${baseUrl}Account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to create account');
      }
  
      const accountData = await response.json();
      const studentId = accountData.id;

      if (registrationInfo.courseId !== '1v1') {
        // Attach student to course
        const courseResponse = await fetch(
          `${baseUrl}Course/${registrationInfo.courseId}/students/rel/${studentId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${registrationInfo.token}`
          }
        });

        if (!courseResponse.ok) {
          throw new Error('Failed to attach student to course');
        }

      }

  
      // Simulate login to get new token
      const loginResponse = await fetch(`${baseUrl}Account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: registerData.username,
          password: registrationInfo.registerData.password 
        })
      });
  
      if (!loginResponse.ok) {
        throw new Error('Failed to login after registration');
      }
  
      const loginData = await loginResponse.json();
      return {
        studentId,
        token: loginData.id
      };
    }

    // Handle add student to course through LOGIN
    async function handleCourseRegistration(loginData) {
      // Update account language preference
      const accountResponse = await fetch(
        `${baseUrl}Account/${loginData.accountId}/?access_token=${loginData.token}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          preferedLanguage: loginData.language
        })
      });
  
      if (!accountResponse.ok) {
        throw new Error('Failed to update account preferences');
      }

      if (loginData.courseId !== '1v1') {
        // Attach student to course
        const courseResponse = await fetch(
          `${baseUrl}Course/${loginData.courseId}/students/rel/${loginData.accountId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${loginData.token}`
          }
        });
    
        if (!courseResponse.ok) {
          throw new Error('Failed to attach student to course');
        }
      }
  
      return loginData.accountId;
    }

    try {
      updateUI('loading', 'Processing...', 'Please wait while we complete your registration.');
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        throw new Error('No session ID found');
      }

      try {
        await verifyStripeSession(sessionId);
        const paymentVerified = true;
        // Check which type of registration we're handling
        const pendingSignupData = localStorage.getItem('pendingSignupData');
        const pendingCourseRegistration = localStorage.getItem('pendingLoginData');

        // Check if there's a trial class that needs payment confirmation (San Diego)
        const trialClassId = localStorage.getItem('trialClassId');
        if (trialClassId) {
          // Update trial class payment status
          await updateTrialClassPayment(trialClassId, sessionId);
          
          updateUI('success', 'Trial Class Payment Complete!', 
            'Your payment has been successfully processed. We will contact you shortly with your trial class details.');
          
          localStorage.removeItem('trialClassId');
          localStorage.removeItem('formCompleted');
          localStorage.removeItem('pricingDetails');
          localStorage.removeItem('pendingRegistration');
          localStorage.removeItem('pendingLoginData');
          localStorage.removeItem('pendingSignupData');
          
        } else if (pendingCourseRegistration && pendingSignupData) {
          // Both exist - compare timestamps and process the most recent one
          const loginData = JSON.parse(pendingCourseRegistration);
          const signupData = JSON.parse(pendingSignupData);
          
          const loginTimestamp = new Date(loginData.timestamp || 0);
          const signupTimestamp = new Date(signupData.timestamp || 0);
          
          if (signupTimestamp > loginTimestamp) {
            // Signup is more recent
            await handleRegistration(signupData);
            updateUI('success', 'Registration Complete!', 
              'Your registration and payment have been successfully processed. We will contact you shortly with your course details.');
          } else {
            // Login is more recent or timestamps are equal
            await handleCourseRegistration(loginData);
            updateUI('success', 'Course Registration Complete!', 
              'Your registration and payment have been successfully processed. We will contact you shortly with your course details.');
          }
          
          // Remove both regardless of which one was processed
          localStorage.removeItem('pendingLoginData');
          localStorage.removeItem('pendingRegistration');
          localStorage.removeItem('pendingSignupData');
          localStorage.removeItem('pricingDetails');
    
        } else if (pendingCourseRegistration) {
          // Handle login registration
          const loginData = JSON.parse(pendingCourseRegistration);
          await handleCourseRegistration(loginData);
          
          updateUI('success', 'Course Registration Complete!', 
            'Your registration and payment have been successfully processed. We will contact you shortly with your course details.');
          
            localStorage.removeItem('pendingLoginData');
            localStorage.removeItem('pendingRegistration');
            localStorage.removeItem('pendingSignupData');
            localStorage.removeItem('pricingDetails');
        } else if (pendingSignupData) {
          // Handle signup registration
          const signupData = JSON.parse(pendingSignupData);
          await handleRegistration(signupData);
  
  
          updateUI('success', 'Registration Complete!', 
            'Your registration and payment have been successfully processed. We will contact you shortly with your course details.');
          
            localStorage.removeItem('pendingLoginData');
            localStorage.removeItem('pendingRegistration');
            localStorage.removeItem('pendingSignupData');
            localStorage.removeItem('pricingDetails');
  
        } else {
          throw new Error('No registration data found');
        }
        
      } catch (error) {
        console.error('Registration process error:', error);

        if (paymentVerified) {
          // Payment succeeded but registration failed
          updateUI('error', 'Registration Processing Issue', 
            'Your payment was successful, but we encountered an issue while creating your account or adding you to the course. Please contact us at (858) 588-7897 or CodingMindSD@gmail.com for assistance. Reference this payment session: ' + sessionId);
        } else {
          // Payment verification failed
          updateUI('error', 'Payment Verification Error',
            'There was an error verifying your payment. Please contact us at (858) 588-7897 or CodingMindSD@gmail.com for assistance. Reference this payment session: ' + sessionId);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      updateUI('error', 'Registration Error',
        'There was an error processing your registration. Please contact us at (858) 588-7897 or CodingMindSD@gmail.com for assistance.');
    }
});