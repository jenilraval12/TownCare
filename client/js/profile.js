// ==========================================
// TownCare - Profile
// ==========================================


// ==========================================
// Get Logged-in User
// ==========================================

const loggedInUser = localStorage.getItem("towncareUser");

if (!loggedInUser) {
    window.location.href = "login.html";
}

const user = JSON.parse(loggedInUser);


// ==========================================
// Display User Information
// ==========================================

document.getElementById("profileDisplayName").textContent =
    user.username;
    
document.getElementById("profileName").textContent =
    user.username;

document.getElementById("profilePhone").textContent =
    user.phone_no;

document.getElementById("profileHouse").textContent =
    user.house_no;

document.getElementById("profileUsername").textContent =
    user.username;


// ==========================================
// Profile Initials
// ==========================================

const initials = user.username
    .trim()
    .split(" ")
    .map(function (name) {
        return name.charAt(0);
    })
    .join("")
    .substring(0, 2)
    .toUpperCase();


// ------------------------------------------
// Profile Avatar
// ------------------------------------------

const profileAvatar =
    document.querySelector(".profile-avatar");

if (profileAvatar) {
    profileAvatar.textContent = initials;
}


// ------------------------------------------
// Navbar Profile Button
// ------------------------------------------

const profileButton =
    document.querySelector(".profile-button");

if (profileButton) {
    profileButton.textContent = initials;
}


// ==========================================
// Logout
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem("towncareUser");

            window.location.href = "login.html";

        }
    );

}