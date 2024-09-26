document.addEventListener("DOMContentLoaded", function () {
  const baseUrl = "https://backend4.sharemyworks.com/api/";
  // const baseUrl = 'http://localhost:3000/api/'
  var urlParams = new URLSearchParams(window.location.search);
  var courseId = urlParams.get("courseId");
  var accountId = urlParams.get("accountId");
  var token = urlParams.get("token");
  var price = urlParams.get("price");
  var chinese = window.location.href.includes("cn");
  var organizationId = urlParams.get("organizationId");

  var registerForm = document.getElementById("registerForm");
  var loadingIndicator = document.querySelector(".loading-indicator");

  registerForm.addEventListener("submit", function (event) {
    console.log("Form submitted");
    event.preventDefault();
    loadingIndicator.style.display = "block";

    var formData = new FormData(registerForm);
    var postData = {
      email2: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirm_password"),
      phone2: formData.get("phone"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      grade: formData.get("grade"),
      organizationId: organizationId,
      username: (
        formData.get("firstName") + formData.get("lastName")
      ).toLowerCase(),
      preferedLanguage: chinese ? "Chinese" : "English",
      dateOfBirth: new Date(),
    };

    console.log("Post data:", postData);

    if (postData.password !== postData.confirmPassword) {
      alert("Passwords do not match.");
      loadingIndicator.style.display = "none";
      return;
    }

    //console.log("Post data:", postData);

    if (accountId) {
      updateAccount(postData, accountId, token);
    } else {
      createAccount(postData);
    }
  });

  function updateAccount(data, accountId, token) {
    fetch(`${baseUrl}Account/${accountId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then(() => fetchInvoices(accountId, courseId, price, token, false))
      .catch((error) => {
        console.error("Update failed", error);
        alert("Update failed. Please try again.");
        loadingIndicator.style.display = "none";
      });
  }

  function createAccount(data) {
    data.username = `${data.username}${Math.floor(Math.random() * 900 + 100)}`; // Generates a random number from 100 to 999
    fetch(`${baseUrl}Account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        attachStudentToCourse(
          data.id,
          courseId,
          token,
          price,
          data.username,
          data.confirmPassword
        );
      })
      .catch((error) => {
        console.error("Registration failed", error);
        Toastify({
                text: "Register failed. Please check your information and try again. Or contact management for help.",
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
  }

  function fetchInvoices(
    accountId,
    courseId,
    price,
    token,
    isNewAccount = false
  ) {
    // Determine the filter based on whether the account is new or existing

    let filter = isNewAccount
      ? JSON.stringify({
          where: {
            courseId: courseId,
          },
        })
      : JSON.stringify({
          order: "date DESC",
          limit: 1,
        });

    fetch(
      `${baseUrl}Account/${accountId}/invoices?access_token=${token}&filter=${encodeURIComponent(
        filter
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((invoices) => {
        if (invoices.length > 0) {
          const invoice = invoices[0];
          Toastify({
                    text: "Registration Success! Redirecting to checkout page.",
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
            window.location.href = `https://www.sharemyworks.com/checkout?invoiceId=${invoice.id}&courseId=${courseId}&studentId=${accountId}&comment=&amount=${invoice.amount}&token=${token}`;
          }, 0);

        } else {
          Toastify({
                    text: "Registration Success ! Redirecting to checkout page failed. Please contact management for help",
                    duration: 5000,
                    close: true,
                    gravity: "top",
                    position: 'right', 
                    style: {
                        background: "red",
                    },
                    className: "info",
            }).showToast();
          console.log("No invoices found.");
        }
        loadingIndicator.style.display = "none";
      })
      .catch((error) => {
        console.error("Failed to fetch invoices", error);
        loadingIndicator.style.display = "none";
      });
  }

function attachStudentToCourse(
    studentId,
    courseId,
    token,
    price,
    username,
    password
  ) {
    fetch(`${baseUrl}Course/${courseId}/students/rel/${studentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        if (organizationId === "66bf6a0dcdae5300148e3a2c") {
          // Redirect to San Diego pricing page
        Toastify({
                    text: "Registration Success! Redirecting to checkout page.",
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
            window.location.href = "/sandiego/pricing"
          }, 0);
        } else {
          // Proceed with the original flow
          // Suppose to get a new token upon registration, simulate login to get the real token
          simulateLogin(username, password, studentId, courseId, price);
        }
        // simulateLogin(username, password, studentId, courseId, price);
      })
      .catch((error) => {
        console.error("Failed to attach student", error);
        alert("Failed to add student to course. Please try again.");
        loadingIndicator.style.display = "none";
      });
  }

  function simulateLogin(username, password, studentId, courseId, price) {
    //console.log("Simulating login", username, password);
    password = password; // Password is not needed for this request
    fetch(`${baseUrl}Account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username,  password }),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log("Logging in :", data);

        token = data.id; // Update the token with a real, newly acquired one
        //console.log("New token:", token);
        fetchInvoices(studentId, courseId, price, token, true);
      })
      .catch((error) => {
        console.error("Login failed", error);
        alert("Login failed. Please try again.");
        loadingIndicator.style.display = "none";
      });
  }
});
