

document.addEventListener("DOMContentLoaded", function () {

    var chinese = window.location.href.includes("cn");

    const baseUrl = "https://backend4.sharemyworks.com/api/";
    const params = new URLSearchParams(window.location.search);
    const accountId = params.get("accountId");
    const token = params.get("token");
    if (!accountId || !token) {
        Toastify({
                text: "No AccountID or Token found. Please check your link and try again. Or contact management for help.",
                duration: 5000,
                close: true,
                gravity: "top", 
                position: 'right',
                style: {
                    background: "red",
                },
                className: "info",
            }).showToast();
        return;
    }

    fetch(`${baseUrl}Account/${accountId}?access_token=${token}`)
        .then((response) => response.json())
        .then((data) => {
            const account = data;
            document.getElementById("firstName").value = account.firstName || "";
            document.getElementById("lastName").value = account.lastName || "";
            document.getElementById("email").value = account.email2 || "";
            document.getElementById("phone").value = account.phone2 || "";            
        })
        .catch((error) => {
            Toastify({
                text: "Link failed. Please check your link and try again. Or contact management for help.",
                duration: 5000,
                close: true,
                gravity: "top", 
                position: 'right',
                style: {
                    background: "red",
                },
                className: "info",
            }).showToast();
            console.error("Error fetching data:", error);
        });

    document
        .getElementById("studentInfoForm")
        .addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the default form submission
            // Validate required fields
            if (!this.checkValidity()) {
                event.stopPropagation();
                Toastify({
                    text: "Please fill in all required fields.",
                    duration: 5000,
                    close: true,
                    gravity: "top", 
                    position: 'right',
                    style: {
                        background: "red",
                    },
                    className: "info",
                }).showToast();
                return;
            }
            const formData = {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                email2: document.getElementById("email").value,
                phone2: document.getElementById("phone").value,
            };

            // PATCH request to update account information
            fetch(`${baseUrl}Account/${accountId}?access_token=${token}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then(() => {
                    // POST request to notify about update
                    return fetch(
                        `${baseUrl}Account/notifyStudentInfoUpdate?access_token=${token}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: "contact@codingmindsacademy.com",
                                content:
                                    `Student ${formData.firstName} ${formData.lastName} has updated his/her information:\n` +
                                    `First Name: ${formData.firstName}\n` +
                                    `Last Name: ${formData.lastName}\n` +
                                    `Email: ${formData.email2}\n` +
                                    `Phone: ${formData.phone2}\n`,
                            }),
                        }
                    );
                })
                .then(() => {
                    Toastify({
                        text: "Update Success!",
                        duration: 5000,
                        close: true,
                        gravity: "top",
                        position: 'right', 
                        style: {
                            background: "green",
                        },
                        className: "info",
                    }).showToast();
                })
                .catch((error) => {
                    console.error("Error updating information:", error);
                    Toastify({
                        text: "Failed to update information. Please try again. Or contact management for help.",
                        duration: 5000,
                        close: true,
                        gravity: "top",
                        position: 'right', 
                        style: {
                            background: "red",
                        },
                        className: "info",
                    }).showToast();
                })
                .finally(() => {
                });
        });
});
