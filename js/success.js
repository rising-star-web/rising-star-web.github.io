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
      console.log('Stripe session verification result:', result);
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

    try {
      updateUI('loading', 'Processing...', 'Please wait while we verify your payment.');
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // Verify payment first
      await verifyStripeSession(sessionId);
      
      // Check which type of payment we're processing
      const trialClassId = localStorage.getItem('trialClassId');
      const registrationAccountId = localStorage.getItem('registrationAccountId');

      if (trialClassId) {
        // Handle trial class payment confirmation
        await updateTrialClassPayment(trialClassId, sessionId);
        
        // Get the account ID from the trial class to update payment history
        try {
          const trialResponse = await fetch(`${baseUrl}TrialClasses/${trialClassId}`);
          if (trialResponse.ok) {
            const trialData = await trialResponse.json();
            const accountId = trialData.accountId;
            
            // Update payment history to mark trial as paid using trialClassId as courseId
            if (accountId) {
              await fetch(`${baseUrl}Account/updatePaymentHistory`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accountId: accountId,
                  courseId: trialClassId,
                  status: "paid",
                  comment: `Trial class - Paid, transaction id: ${sessionId}`
                })
              });
              console.log('Trial payment history updated to paid status');
            }
          }
        } catch (error) {
          console.error('Failed to update trial payment history:', error);
        }
        
        updateUI('success', 'Trial Class Payment Complete!', 
          'Your payment has been successfully processed. We will contact you shortly with your trial class details.');
          
      } else if (registrationAccountId) {
        // Handle immediate registration payment confirmation
        const courseId = localStorage.getItem('registrationCourseId');
        
        // Update payment history to mark as paid
        try {
          const paymentData = {
            accountId: registrationAccountId,
            status: "paid"
          };
          
          if (courseId === '1v1') {
            paymentData.comment = `1v1 - Paid, transaction id: ${sessionId}`;
          } else if (courseId) {
            paymentData.courseId = courseId;
            paymentData.comment = `Paid, transaction id: ${sessionId}`;
          } else {
            paymentData.comment = `Paid, transaction id: ${sessionId}`;
          }
          
          await fetch(`${baseUrl}Account/updatePaymentHistory`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData)
          });
          console.log('Payment history updated to paid status');
        } catch (error) {
          console.error('Failed to update payment history:', error);
        }
        
        updateUI('success', 'Registration Complete!', 
          'Your payment has been successfully processed. Your account is now active and you have access to your course.');
          
      } else {
        // Fallback - no specific data found but payment was verified
        updateUI('success', 'Payment Complete!', 
          'Your payment has been successfully processed. We will contact you shortly with details.');
      }
      
      // Comprehensive localStorage cleanup
      localStorage.removeItem('trialClassId');
      localStorage.removeItem('registrationAccountId');
      localStorage.removeItem('registrationCourseId');
      localStorage.removeItem('registrationToken');
      localStorage.removeItem('formCompleted');
      localStorage.removeItem('pricingDetails');
      localStorage.removeItem('pendingRegistration');
      localStorage.removeItem('pendingLoginData');
      localStorage.removeItem('pendingSignupData');
      
    } catch (error) {
      console.error('Payment verification error:', error);
      updateUI('error', 'Payment Verification Error',
        'There was an error verifying your payment. Please contact us at (858) 588-7897 or CodingMindSD@gmail.com for assistance. Reference this payment session: ' + (new URLSearchParams(window.location.search).get('session_id') || 'N/A'));
    }
});