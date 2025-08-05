document.addEventListener("DOMContentLoaded", function () {
    const baseUrl = "https://backend4.sharemyworks.com/api/";
    //const baseUrl = 'http://localhost:3000/api/'
    var loginForm = document.getElementById("loginForm");
    var loadingIndicator = document.querySelector(".loading-indicator");

    var urlParams = new URLSearchParams(window.location.search);
    var courseId = urlParams.get("courseId");
    var accountId = urlParams.get("accountId");
    var token = urlParams.get("token");
    var price = urlParams.get("price");
    var chinese = window.location.href.includes("cn");
    var organizationId = urlParams.get("organizationId");

    const isSandiego = organizationId == "66bf6a0dcdae5300148e3a2c" || organizationId == "6713eacd00dcfc85b65c206a";

    if (courseId) {
        populateCourseInfoCard(courseId, token);
    } else {
        const courseInfoCard = document.querySelector('.card.shadow-lg.mb-5');
        if (courseInfoCard) {
            courseInfoCard.style.display = 'none';
        }
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        loadingIndicator.style.display = "block";

        try {
            var formData = new FormData(loginForm);
            var userInput = formData.get("userinput");
            var isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userInput);
            
            var postData = {
                password: formData.get("loginPassword")
            };
            
            if (isEmail) {
                postData.email = userInput;
            } else {
                postData.username = userInput;
            }
            const loginResponse = await fetch(`${baseUrl}Account/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(postData)
            });
            if (!loginResponse.ok) {
                throw new Error('Login failed');
            }
    
            const loginData = await loginResponse.json();
            var acc_token = token;
            token = loginData.id;
            accountId = loginData.userId;

            if (isSandiego) {
                // For San Diego, update account and link to course immediately
                console.log('San Diego login - processing account immediately');
                
                try {
                    // Update account language preference directly (no course linking)
                    const updateResponse = await fetch(`${baseUrl}Account/${accountId}/?access_token=${token}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ preferedLanguage: chinese ? "Chinese" : "English" })
                    });

                    if (!updateResponse.ok) {
                        console.error('Failed to update account preferences');
                        // Continue anyway - not critical
                    }
                    
                    // Handle course linking and payment history
                    if (courseId) {
                        if (courseId !== '1v1') {
                            // Link to regular course
                            console.log('Linking existing user to course:', courseId);
                            const courseResponse = await fetch(`${baseUrl}Course/${courseId}/students/rel/${accountId}`, {
                                method: "PUT",
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            if (!courseResponse.ok) {
                                console.error('Failed to attach student to course');
                                // Continue anyway - can be fixed manually
                            } else {
                                console.log('Student successfully linked to course');
                            }
                        }
                        
                        // Add payment history record for both regular and 1v1 courses
                        try {
                            const paymentData = {
                                accountId: accountId,
                                status: "payment_pending"
                            };
                            
                            if (courseId === '1v1') {
                                paymentData.comment = "1v1 - payment pending";
                            } else {
                                paymentData.courseId = courseId;
                                paymentData.comment = "Course login - payment pending";
                            }
                            
                            const paymentHistoryResponse = await fetch(`${baseUrl}Account/updatePaymentHistory`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(paymentData)
                            });
                            
                            if (paymentHistoryResponse.ok) {
                                console.log('Payment history record created');
                            } else {
                                console.error('Failed to create payment history record');
                            }
                        } catch (error) {
                            console.error('Error creating payment history record:', error);
                        }
                    }

                    // Store account info for payment processing  
                    localStorage.setItem('registrationAccountId', accountId);
                    localStorage.setItem('registrationCourseId', courseId || '');
                    localStorage.setItem('registrationToken', token);
                    
                    loadingIndicator.style.display = "none";
                    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
                    confirmModal.show();
                    
                    document.getElementById('confirmRedirect').addEventListener('click', function() {
                        Toastify({
                            text: "Redirecting to pricing page...",
                            duration: 1000,
                            close: true,
                            gravity: "top",
                            position: 'right',
                            style: {
                                background: "green",
                            },
                            className: "info",
                        }).showToast();

                        // Hide modal and redirect
                        confirmModal.hide();
                        setTimeout(() => {
                            window.location.href = "/sandiego/pricing";
                        }, 500);
                    });
                    
                } catch (error) {
                    console.error('San Diego login processing failed:', error);
                    loadingIndicator.style.display = "none";
                    
                    // Show error message to user
                    Toastify({
                        text: "Login processing failed. Please try again or contact us at (858) 588-7897 for assistance.",
                        duration: 5000,
                        close: true,
                        gravity: "top",
                        position: 'right',
                        style: {
                            background: "red",
                        },
                        className: "info",
                    }).showToast();
                }
            } else {
                // Original flow for non-San Diego users
                await updateAccount({ preferedLanguage: chinese ? "Chinese" : "English" }, accountId, acc_token, token);
            }

        } catch (error) {
            console.error("Process failed", error);
            Toastify({
                text: "Login failed. Please check your credentials and try again. Username can be found in your email. Please contact management for help if you are unable to login.",
                duration: 5000,
                close: true,
                gravity: "top",
                position: 'right',
                style: {
                    background: "red",
                },
                className: "info",
            }).showToast();
            loadingIndicator.style.display = "none";
        }
    });

    function populateCourseInfoCard(courseId, token) {
        // For 1v1 private class, show TBD
        if (courseId === "1v1" && isSandiego) {
            document.getElementById("loginCourseName").innerText = "1v1 private class";
            // For San Diego: Hide dates and price elements
            const datesElement = document.getElementById("loginCourseDates");
            const priceContainer = document.getElementById("priceContainer");
            
            // Hide the entire date row (including "Course Date:" label)
            if (datesElement) {
                const dateRow = datesElement.closest('.row');
                if (dateRow) {
                    dateRow.style.display = "none";
                }
            }
            if (priceContainer) {
                priceContainer.style.display = "none";
            }
            return;
        }
    
        const apiUrl = baseUrl + "Course/";
        const url = `${apiUrl}${courseId}?filter=${encodeURIComponent(
            JSON.stringify({ include: ["instructor", "classDays", "coursesDB"] })
        )}`;
    
        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((course) => {
                // Update course info card
                document.getElementById("loginCourseName").innerText = course.name;
                
                if (isSandiego) {
                    // For San Diego: Hide dates and price, only show course name
                    const datesElement = document.getElementById("loginCourseDates");
                    const priceContainer = document.getElementById("priceContainer");
                    
                    // Hide the entire date row (including "Course Date:" label)
                    if (datesElement) {
                        const dateRow = datesElement.closest('.row');
                        if (dateRow) {
                            dateRow.style.display = "none";
                        }
                    }
                    if (priceContainer) {
                        priceContainer.style.display = "none";
                    }
                } else {
                    // For other locations: Show dates and price as before
                    document.getElementById("loginCourseDates").innerText = 
                        course.dateStart.split("T")[0] + " - " + course.dateEnd.split("T")[0];
                    
                    const priceContainer = document.getElementById("priceContainer");
                    if (course.price && course.price !== 0) {
                        document.getElementById("loginCoursePrice").innerText = "$" + course.price;
                        priceContainer.classList.remove("d-none");
                        priceContainer.classList.add("d-flex");
                    } else {
                        priceContainer.classList.add("d-none");
                        priceContainer.classList.remove("d-flex");
                    }
                }
            })
            .catch((error) => {
                console.error("Failed to fetch course details:", error);
                // Hide the course info card if there's an error
                const courseInfoCard = document.querySelector('.card.shadow-lg.mb-5');
                if (courseInfoCard) {
                    courseInfoCard.style.display = 'none';
                }
            });
    }

    function updateAccount(data, accountId, access_token, token) {
        fetch(`${baseUrl}Account/${accountId}/?access_token=${token}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(() => {
            attachStudentToCourse(accountId, courseId, token, price);
        })
        .catch(error => {
            console.error("Update failed", error);
            alert("Update failed. Please try again.");
            loadingIndicator.style.display = "none";
        });
    }

    function attachStudentToCourse(accountId, courseId, token, price) {
        fetch(`${baseUrl}Course/${courseId}/students/rel/${accountId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            if (isSandiego) {
                // Redirect to San Diego pricing page
                Toastify({
                    text: "Login Success! Redirecting to San Diego pricing page.",
                    duration: 5000,
                    close: true,
                    gravity: "top",
                    position: 'right', 
                    style: {
                        background: "green",
                    },
                    className: "info",
                }).showToast();
                
                setTimeout(() => {
                    window.location.href = "/sandiego/pricing";
                }, 0);
            } else {
                // Proceed with the original flow
                fetchInvoices(accountId, courseId, price, token);
            }
        })
        .catch(error => {
            console.error("Failed to attach student", error);
            alert("Failed to add student to course. Please try again.");
            loadingIndicator.style.display = "none";
        });
    }

    function fetchInvoices(accountId, courseId, price, token) {
        let filter = JSON.stringify({
            //where: { courseId: courseId },
            order: "date DESC",
            limit: 1
        });

        fetch(`${baseUrl}Account/${accountId}/invoices?access_token=${token}&filter=${encodeURIComponent(filter)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(invoices => {
            if (invoices.length > 0) {
                const invoice = invoices[0];
                Toastify({
                    text: "Login Success ! Redirecting to checkout page.",
                    duration: 5000,
                    close: true,
                    gravity: "top",
                    position: 'right', 
                    style: {
                        background: "green",
                    },
                    className: "info",
                }).showToast();
                
                setTimeout(() => {
                    window.location.href = `https://www.sharemyworks.com/checkout?invoiceId=${invoice.id}&courseId=${courseId}&studentId=${accountId}&amount=${invoice.amount}&token=${token}`;
                },0);
            } else {
                Toastify({
                    text: "Login Success ! Redirecting to checkout page failed. Please contact management for help",
                    duration: 5000,
                    close: true,
                    gravity: "top",
                    position: 'right', 
                    style: {
                        background: "red",
                    },
                    className: "info",
            }).showToast();
            }
            loadingIndicator.style.display = "none";
        })
        .catch(error => {
            console.error("Failed to fetch invoices", error);
            loadingIndicator.style.display = "none";
        });
    }


});
