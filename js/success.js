// success.js
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    const loadingSpinner = document.getElementById('loadingSpinner');
    const successIcon = document.getElementById('successIcon');
    const errorIcon = document.getElementById('errorIcon');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    const backButton = document.getElementById('backButton');
    
    const baseUrl = 'https://prod-sharemyworks-backend.herokuapp.com/api/';
    // const baseUrl = 'http://localhost:3000/api/';

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

    async function handleTrialRegistration(formData) {      
      // Create account with proper encoding
      var formBody = [];
      for (var property in formData.accountData) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(formData.accountData[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
  
      const accountResponse = await fetch(`${baseUrl}Account`, {
        mode: "cors",
        method: "post",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
      });
  
      if (!accountResponse.ok) {
        throw new Error('Failed to create account');
      }
  
      const accountResult = await accountResponse.json();
      const studentId = accountResult.id;
    
      if (!studentId) {
        throw new Error('No student ID returned');
      } else if (studentId) {
  
        // Create trial class with proper encoding
        const trialData = {
          ...formData.trialData,
          accountId: studentId
        };
    
        var formBody2 = [];
        for (var property in trialData) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(trialData[property]);
          formBody2.push(encodedKey + "=" + encodedValue);
        }
        formBody2 = formBody2.join("&");
    
        const trialResponse = await fetch(`${baseUrl}TrialClasses`, {
          mode: "cors",
          method: "post",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: formBody2
        });
    
        if (!trialResponse.ok) {
          throw new Error('Failed to create trial class');
        }
      }
      return studentId;
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

      await verifyStripeSession(sessionId);
      // Check which type of registration we're handling
      const pendingTrialRegistration = localStorage.getItem('pendingRegistration');
      const pendingCourseRegistration = localStorage.getItem('pendingLoginData');
      const pendingSignupData = localStorage.getItem('pendingSignupData');

      if (pendingTrialRegistration) {
        // Handle trial class registration
        const formData = JSON.parse(pendingTrialRegistration);
        await handleTrialRegistration(formData);
        
        updateUI('success', 'Trial Class Registration Complete!', 
          'Your registration and payment have been successfully processed. We will contact you shortly with your trial class details.');
        
        localStorage.removeItem('pendingRegistration');
        localStorage.setItem('formCompleted', 'true');
        localStorage.removeItem('pricingDetails');
  
      } else if (pendingCourseRegistration) {
        // Handle login registration
        const loginData = JSON.parse(pendingCourseRegistration);
        await handleCourseRegistration(loginData);
        
        updateUI('success', 'Course Registration Complete!', 
          'Your registration and payment have been successfully processed.');
        
        localStorage.removeItem('pendingLoginData');
        localStorage.removeItem('pricingDetails');
      } else if (pendingSignupData) {
        // Handle signup registration
        const signupData = JSON.parse(pendingSignupData);
        await handleRegistration(signupData);


        updateUI('success', 'Registration Complete!', 
          'Your registration and payment have been successfully processed. We will contact you shortly with your course details.');
        
        localStorage.removeItem('pendingSignupData');
        localStorage.removeItem('pricingDetails');

      } else {
        throw new Error('No registration data found');
      }
  
    } catch (error) {
      console.error('Registration error:', error);
      updateUI('error', 'Registration Error',
        'There was an error processing your registration. Please contact us at (858) 588-7897 or CodingMindSD@gmail.com for assistance.');
    }
});