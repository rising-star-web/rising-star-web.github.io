

document.addEventListener("DOMContentLoaded", function () {

    var chinese = window.location.href.includes("cn");
    const daysEnglish = ['Every Monday', 'Every Tuesday', 'Every Wednesday', 'Every Thursday', 'Every Friday', 'Every Saturday', 'Every Sunday'];
    const daysChinese = ['每周一', '每周二', '每周三', '每周四', '每周五', '每周六', '每周日'];
    const days = chinese ? daysChinese : daysEnglish;
    const timesContainer = document.getElementById('availableTimes');
    days.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'form-check';
        
        
        const dayLabel = document.createElement('label');
        dayLabel.textContent = day;
        dayDiv.appendChild(dayLabel);
        for (let hour = 8; hour <= 20; hour++) {
            const checkboxLabel = document.createElement('label');
            checkboxLabel.className = 'checkbox-label form-check-label';
            checkboxLabel.style.display = 'block';
            checkboxLabel.style.marginLeft = '20px';
            
            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.name = `${day.toLowerCase()}[]`;
            checkbox.value = `${hour}:00 - ${hour + 1}:00`;

            
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.appendChild(document.createTextNode(` ${hour}:00 - ${hour + 1}:00`));

            
            dayDiv.appendChild(checkboxLabel);
        }

        
        timesContainer.appendChild(dayDiv);
    });


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
            const availableTimes = days.map(day => {
                return Array.from(document.querySelectorAll(`input[name='${day.toLowerCase()}[]']:checked`)).map(checkbox => checkbox.value);
            });
            const formData = {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                availableTime: JSON.stringify(availableTimes)
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
                                    `Date of Birth: ${formData.dateOfBirth}\n` +
                                    `Available Time: ${formData.availableTime}\n`,
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
