// ==========================================
// TownCare - Login
// ==========================================


// Get HTML elements
const loginForm = document.getElementById("loginForm");

const houseNumber = document.getElementById("houseNumber");

const mobileNumber = document.getElementById("mobileNumber");

const password = document.getElementById("password");


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
// Login Form
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Get entered values
    const selectedHouseNumber = houseNumber.value;

    const enteredMobileNumber = mobileNumber.value.trim();

    const enteredPassword = password.value;


    // ==========================================
    // Basic Validation
    // ==========================================

    if (selectedHouseNumber === "") {

        alert("Please select your house number.");

        return;
    }


    if (enteredMobileNumber === "") {

        alert("Please enter your mobile number.");

        return;
    }


    if (!/^\d{10}$/.test(enteredMobileNumber)) {

        alert("Please enter a valid 10-digit mobile number.");

        return;
    }


    if (enteredPassword.trim() === "") {

        alert("Please enter your password.");

        return;
    }


    // ==========================================
    // Send Login Request
    // ==========================================

    try {

        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    house_no: selectedHouseNumber,

                    phone_no: enteredMobileNumber,

                    password: enteredPassword

                })
            }
        );


        const data = await response.json();


        // ==========================================
        // Login Successful
        // ==========================================

        if (response.ok) {

            localStorage.setItem(
                "towncareUser",
                JSON.stringify(data.user)
            );


            window.location.href = "home.html";

            return;
        }


        // ==========================================
        // Login Failed
        // ==========================================

        alert(
            data.message ||
            "Login failed. Please check your details."
        );

    }

    catch (error) {

        console.error("Login Error:", error);

        alert(
            "Unable to connect to the server. Make sure your TownCare backend is running."
        );
    }

});