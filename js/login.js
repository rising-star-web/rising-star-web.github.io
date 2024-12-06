document.addEventListener("DOMContentLoaded", function () {
    const baseUrl = 'https://prod-sharemyworks-backend.herokuapp.com/api/';
    // const baseUrl = "https://backend4.sharemyworks.com/api/";
    // const baseUrl = 'http://localhost:3000/api/'
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

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        loadingIndicator.style.display = "block";

        try {
            var formData = new FormData(loginForm);
            var postData = {
                username: formData.get("username"),
                password: formData.get("loginPassword")
            };
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
                // Store login data in localStorage
                const loginInfo = {
                    accountId: accountId,
                    token: token,
                    acc_token: acc_token,
                    courseId: courseId,
                    price: price,
                    language: chinese ? "Chinese" : "English",
                    organizationId: organizationId
                };
                
                localStorage.setItem('pendingLoginData', JSON.stringify(loginInfo));
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
