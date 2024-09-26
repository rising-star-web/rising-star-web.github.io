document.addEventListener("DOMContentLoaded", function () {
    const baseUrl = "https://backend4.sharemyworks.com/api/";
    var loginForm = document.getElementById("loginForm");
    var loadingIndicator = document.querySelector(".loading-indicator");


    var urlParams = new URLSearchParams(window.location.search);
    var courseId = urlParams.get("courseId");
    var accountId = urlParams.get("accountId");
    var token = urlParams.get("token");
    var price = urlParams.get("price");
    var chinese = window.location.href.includes("cn");
    var organizationId = urlParams.get("organizationId");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        loadingIndicator.style.display = "block";

        var formData = new FormData(loginForm);
        var postData = {
            username: formData.get("username"),
            password: formData.get("loginPassword")
        };
        fetch(`${baseUrl}Account/login`, {
            method: "POST",
            
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            var acc_token = token
            token = data.id;
            accountId = data.userId;
            

            updateAccount({ preferedLanguage: chinese ? "Chinese" : "English" }, accountId,acc_token ,token);
        })
        .catch((error) => {
            console.error("Login failed", error);
            Toastify({
                text: "Login failed. Please check your credentials and try again. Or contact management for help.",
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
        });
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
            if (organizationId === "66bf6a0dcdae5300148e3a2c") {
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
