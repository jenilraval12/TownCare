// ==========================================
// TownCare - Admin Login
// ==========================================


// ==========================================
// API Configuration
// ==========================================

const API_URL = "http://localhost:3000";


// ==========================================
// Get HTML Elements
// ==========================================

const adminLoginForm =
    document.getElementById("adminLoginForm");

const phoneNumber =
    document.getElementById("phoneNumber");

const password =
    document.getElementById("password");

const errorMessage =
    document.getElementById("errorMessage");


// ==========================================
// Display Error Message
// ==========================================

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.style.display = "block";

}


// ==========================================
// Hide Error Message
// ==========================================

function hideError() {

    errorMessage.textContent = "";

    errorMessage.style.display = "none";

}


// ==========================================
// Admin Login
// ==========================================

adminLoginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideError();


        const enteredPhone =
            phoneNumber.value.trim();

        const enteredPassword =
            password.value;


        // --------------------------------------
        // Validate Mobile Number
        // --------------------------------------

        if (enteredPhone === "") {

            showError(
                "Please enter your mobile number."
            );

            return;
        }


        if (!/^[0-9]{10}$/.test(enteredPhone)) {

            showError(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        // --------------------------------------
        // Validate Password
        // --------------------------------------

        if (enteredPassword.trim() === "") {

            showError(
                "Please enter your password."
            );

            return;
        }


        // --------------------------------------
        // Send Login Request
        // --------------------------------------

        try {

            const response = await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        phone_no: enteredPhone,

                        password: enteredPassword

                    })
                }
            );


            const data =
                await response.json();


            // --------------------------------------
            // Login Failed
            // --------------------------------------

            if (!response.ok) {

                showError(
                    data.message ||
                    "Invalid mobile number or password."
                );

                return;
            }


            // --------------------------------------
            // Verify Admin Role
            // --------------------------------------

            if (
                !data.user ||
                data.user.role !== "admin"
            ) {

                showError(
                    "You are not authorized to access the admin panel."
                );

                return;
            }


            // --------------------------------------
            // Store Admin Information
            // --------------------------------------

            localStorage.setItem(
                "towncareAdmin",
                JSON.stringify(data.user)
            );


            // --------------------------------------
            // Go To Admin Dashboard
            // --------------------------------------

            window.location.href =
                "dashboard.html";

        }

        catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );


            showError(
                "Unable to connect to the server. Make sure your TownCare backend is running."
            );

        }

    }
);