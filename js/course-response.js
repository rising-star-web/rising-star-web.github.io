// /**
//  * Course Response Handler
//  * Shared JavaScript for handling course continuation and questions responses
//  */

// class CourseResponseHandler {
//     constructor() {
//         this.baseUrl = "https://backend4.sharemyworks.com/api/";
//         //this.baseUrl = "http://localhost:3000/api/";
//         this.apiUrl = this.baseUrl + "Feedback/courseResponse";
//     }

//     // Get URL parameters
//     getUrlParameter(name) {
//         name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
//         var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
//         var results = regex.exec(location.search);
//         return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
//     }

//     // Show error toast notification
//     showErrorToast(message) {
//         // Create toast if it doesn't exist
//         let errorToast = document.getElementById('errorToast');
//         if (!errorToast) {
//             this.createErrorToast();
//             errorToast = document.getElementById('errorToast');
//         }

//         const errorToastBody = document.getElementById('errorToastBody');
//         errorToastBody.textContent = message || 'Failed to record your response. Please contact us directly.';
        
//         // Initialize and show toast (Bootstrap 5)
//         const toast = new bootstrap.Toast(errorToast, {
//             autohide: true,
//             delay: 5000
//         });
//         toast.show();
//     }

//     // Create error toast HTML if it doesn't exist
//     createErrorToast() {
//         const toastHtml = `
//             <div id="errorToast" class="toast position-fixed top-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true" style="z-index: 9999;">
//                 <div class="toast-header bg-danger text-white">
//                     <strong class="me-auto">Error</strong>
//                     <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
//                 </div>
//                 <div class="toast-body" id="errorToastBody">
//                     Failed to record your response. Please contact us directly.
//                 </div>
//             </div>
//         `;
//         document.body.insertAdjacentHTML('beforeend', toastHtml);
//     }

//     // Make API call to record response
//     async recordResponse(studentId, courseStatusId, responseType, questions = null) {
//         const payload = {
//             studentId: studentId,
//             courseStatusId: courseStatusId,
//             responseType: responseType
//         };

//         if (questions) {
//             payload.questions = questions;
//         }

//         try {
//             const response = await fetch(this.apiUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(payload)
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log('Response recorded:', data);
//             const result = data.result;
            
//             if (!result.success) {
//                 console.log('result.success: ', result.success);
//                 throw new Error(result.message || 'Failed to record response');
//             }

//             return { success: true, data: result };
//         } catch (error) {
//             console.error('Error recording response:', error);
//             return { success: false, error: error.message };
//         }
//     }

//     // Handle continue page logic
//     handleContinuePage() {
//         const studentId = this.getUrlParameter('studentId');
//         const courseStatusId = this.getUrlParameter('courseStatusId');
        
//         if (!studentId || !courseStatusId) {
//             this.showErrorToast('Missing required information. Please use the link from your email.');
//             return;
//         }
        
//         // Auto-trigger API call for continue response
//         this.recordResponse(studentId, courseStatusId, 'continue')
//             .then(result => {
//                 if (result.success) {
//                     console.log('Continue response recorded successfully');
//                 } else {
//                     this.showErrorToast('Failed to record your response. Please contact us directly at hello@codingmind.com or 949-236-7896.');
//                 }
//             });
//     }

//     // Handle questions page form submission
//     handleQuestionsPage() {
//         const studentId = this.getUrlParameter('studentId');
//         const courseStatusId = this.getUrlParameter('courseStatusId');
        
//         if (!studentId || !courseStatusId) {
//             this.showErrorToast('Missing required information. Please use the link from your email.');
//             return;
//         }

//         // Auto-trigger API call for questions response (without questions text)
//         this.recordResponse(studentId, courseStatusId, 'questions')
//             .then(result => {
//                 if (!result.success) {
//                     this.showErrorToast('Failed to record your response. Please contact us directly at hello@codingmind.com or 949-236-7896.');
//                 }
//             });

//         // Handle optional questions form submission
//         const questionsForm = document.getElementById('questionsForm');
//         if (questionsForm) {
//             questionsForm.addEventListener('submit', (e) => {
//                 e.preventDefault();
                
//                 const questionsText = document.getElementById('questions').value.trim();
                
//                 if (questionsText) {
//                     // Submit questions to API
//                     this.recordResponse(studentId, courseStatusId, 'questions', questionsText)
//                         .then(result => {
//                             if (result.success) {
//                                 // Hide form and show success message
//                                 document.getElementById('formHeader').style.display = 'none';
//                                 document.getElementById('questionsForm').style.display = 'none';
//                                 document.getElementById('successMessage').style.display = 'block';
//                             } else {
//                                 this.showErrorToast('Failed to submit your questions. Please contact us directly.');
//                             }
//                         });
//                 } else {
//                     // Just show success message without submitting questions
//                     document.getElementById('formHeader').style.display = 'none';
//                     document.getElementById('questionsForm').style.display = 'none';
//                     document.getElementById('successMessage').style.display = 'block';
//                 }
//             });
//         }
//     }
// }

// // Initialize the handler when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     const handler = new CourseResponseHandler();
    
//     // Determine page type based on URL or page-specific elements
//     if (window.location.pathname.includes('course-continue-confirmation')) {
//         handler.handleContinuePage();
//     } else if (window.location.pathname.includes('course-questions-contact')) {
//         handler.handleQuestionsPage();
//     }
// });