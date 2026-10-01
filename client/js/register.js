// ==========================================
// TownCare - Registration
// ==========================================


// Get HTML elements
const houseNumber = document.getElementById("houseNumber");

const registerForm = document.getElementById("registerForm");

const successMessage = document.getElementById("successMessage");

const errorMessage = document.getElementById("errorMessage");


// ==========================================
// Generate House Numbers
// ==========================================

const blocks = ["A", "B"];

blocks.forEach(function (block) {

    for (let building = 1; building <= 10; building++) {

        const buildingNumber = String(building).padStart(2, "0");

        for (let flat = 1; flat <= 12; flat++) {

            const option = document.createElement("option");

            option.value = `${block}-${buildingNumber}/${flat}`;

            option.textContent = `${block}-${buildingNumber}/${flat}`;

            houseNumber.appendChild(option);
        }
    }
});


// ==========================================
// Registration Form
// ==========================================

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Hide previous messages
    successMessage.style.display = "none";
    errorMessage.style.display = "none";


    // Get values
    const house_no = houseNumber.value;

    const username =
        document.getElementById("username").value.trim();

    const phone_no =
        document.getElementById("mobileNumber").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    // ==========================================
    // Validation
    // ==========================================

    if (house_no === "") {

        showError("Please select your house number.");

        return;
    }


    if (username === "") {

        showError("Please enter your full name.");

        return;
    }


    if (phone_no === "") {

        showError("Please enter your mobile number.");

        return;
    }


    if (!/^\d{10}$/.test(phone_no)) {

        showError("Please enter a valid 10-digit mobile number.");

        return;
    }


    if (password === "") {

        showError("Please enter a password.");

        return;
    }


    if (confirmPassword === "") {

        showError("Please confirm your password.");

        return;
    }


    if (password !== confirmPassword) {

        showError("Passwords do not match.");

        return;
    }


    // ==========================================
    // Send Registration Request
    // ==========================================

    try {

        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    house_no: house_no,

                    username: username,

                    phone_no: phone_no,

                    password: password

                })
            }
        );


        const data = await response.json();


        // ==========================================
        // Registration Successful
        // ==========================================

        if (response.ok) {

            successMessage.textContent =
                "Registration request submitted successfully. Please wait for admin approval.";

            successMessage.style.display = "block";


            registerForm.reset();

            return;
        }


        // ==========================================
        // Registration Failed
        // ==========================================

        showError(
            data.message ||
            "Unable to submit registration request."
        );

    }

    catch (error) {

        console.error("Registration Error:", error);

        showError(
            "Unable to connect to the server. Make sure your TownCare backend is running."
        );
    }

});


// ==========================================
// Show Error
// ==========================================

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.style.display = "block";
}