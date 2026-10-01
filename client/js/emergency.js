// ==========================================
// TownCare - Emergency Numbers
// ==========================================


// ==========================================
// Check Login Status
// ==========================================

const loggedInUser = localStorage.getItem("towncareUser");

if (!loggedInUser) {
    window.location.href = "login.html";
}

const user = JSON.parse(loggedInUser);


// ==========================================
// Get All Call Buttons
// ==========================================

const callButtons = document.querySelectorAll(".call-btn");


// ==========================================
// Add Confirmation Before Making a Call
// ==========================================

callButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

        const contactName =
            button
                .closest(".contact-card")
                .querySelector("h3")
                .textContent;


        const confirmCall = confirm(
            "Do you want to call " + contactName + "?"
        );


        if (!confirmCall) {
            event.preventDefault();
        }

    });

});