// ==========================================
// TownCare - Visitors
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
// API URL
// ==========================================

const API_URL = "http://localhost:3000";

// ==========================================
// Get HTML Elements
// ==========================================

const visitorForm = document.getElementById("visitorForm");

const addVisitorButton = document.getElementById("addVisitorButton");

const visitorFormSection = document.getElementById("visitorFormSection");

const cancelVisitorButton = document.getElementById("cancelVisitorButton");

const copyOtpButton = document.getElementById("copyOtpButton");

const visitorList = document.getElementById("visitorList");

const noVisitors = document.getElementById("noVisitors");

const formMessage = document.getElementById("formMessage");

const activeInvitation = document.getElementById("activeInvitation");

const invitationModal = document.getElementById("invitationModal");

const closeInvitationModal = document.getElementById("closeInvitationModal");

const closeInvitationButton = document.getElementById("closeInvitationButton");

// ==========================================
// Visitors
//
// These records now come from MySQL.
// ==========================================

let visitors = [];

// ==========================================
// Generate Random Six-Digit OTP
// ==========================================

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// Convert YYYY-MM-DD into Readable Date
// ==========================================

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString + "T00:00:00");

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// Convert 24-Hour Time into 12-Hour Format
// ==========================================

function formatTime(timeString) {
  if (!timeString) {
    return "";
  }

  const timeParts = timeString.split(":");

  const hours = Number(timeParts[0]);

  const minutes = Number(timeParts[1]);

  const date = new Date();

  date.setHours(hours);

  date.setMinutes(minutes);

  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ==========================================
// Get Today's Date
// ==========================================

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==========================================
// Display Visitors
// ==========================================

function displayVisitors() {
  visitorList.innerHTML = "";

  if (visitors.length === 0) {
    noVisitors.style.display = "block";

    return;
  }

  noVisitors.style.display = "none";

  visitors.forEach(function (visitor) {
    const visitorCard = document.createElement("div");

    visitorCard.className = "visitor-card";

    const statusClass =
      visitor.status === "completed"
        ? "completed"
        : visitor.status === "inside"
          ? "inside"
          : "upcoming";

    const statusText =
      visitor.status === "completed"
        ? "Completed"
        : visitor.status === "inside"
          ? "Inside"
          : "Upcoming";

    visitorCard.innerHTML = `

      <div class="visitor-card-header">

        <div>

          <h3>
            ${visitor.name}
          </h3>

          <div class="visitor-card-date">
            ${formatDate(visitor.visitDate)}
          </div>

        </div>


        <span
          class="visitor-status ${statusClass}"
        >
          ${statusText}
        </span>

      </div>


      <div class="visitor-details">


        <div class="visitor-detail">

          <span>
            Mobile
          </span>

          <span>
            ${visitor.mobile}
          </span>

        </div>


        <div class="visitor-detail">

          <span>
            Vehicle
          </span>

          <span>
            ${visitor.vehicle || "No Vehicle"}
          </span>

        </div>


        <div class="visitor-detail">

          <span>
            Expected Time
          </span>

          <span>
            ${formatTime(visitor.expectedTime)}
          </span>

        </div>


        <div class="visitor-detail">

          <span>
            Purpose
          </span>

          <span>
            ${visitor.purpose}
          </span>

        </div>


        <div class="visitor-detail">

          <span>
            Valid Till
          </span>

          <span>
            ${formatTime(visitor.validTill)}
          </span>

        </div>


        <div class="visitor-detail">

          <span>
            OTP
          </span>

          <span>
            ${visitor.otp}
          </span>

        </div>


      </div>

    `;

    visitorList.appendChild(visitorCard);
  });
}

// ==========================================
// Load Visitors from MySQL
// ==========================================

async function loadVisitors() {
  try {
    const response = await fetch(`${API_URL}/api/visitors/${user.id}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load visitor records.");
    }

    visitors = data.visitors.map(function (visitor) {
      return {
        id: visitor.id,

        name: visitor.visitor_name,

        mobile: visitor.mobile,

        vehicle: visitor.vehicle,

        visitDate: visitor.visit_date,

        expectedTime: visitor.expected_time,

        purpose: visitor.purpose,

        validTill: visitor.valid_till,

        otp: visitor.otp,

        status: visitor.status,
      };
    });

    displayVisitors();
  } catch (error) {
    console.error("Load visitors error:", error);

    visitors = [];

    displayVisitors();

    showFormMessage("Unable to load visitor records from the server.", "error");
  }
}

// ==========================================
// Display Active Invitation
// ==========================================

function displayInvitation(visitor) {
  document.getElementById("invitedTo").textContent = visitor.name;

  document.getElementById("invitedBy").textContent =
    `${user.username} - ${user.house_no}`;

  document.getElementById("visitingDate").textContent = formatDate(
    visitor.visitDate,
  );

  document.getElementById("expectedTime").textContent = formatTime(
    visitor.expectedTime,
  );

  document.getElementById("otpCode").textContent = visitor.otp;

  document.getElementById("visitorName").textContent = visitor.name;

  document.getElementById("validTill").textContent = formatTime(
    visitor.validTill,
  );

  activeInvitation.style.display = "block";
}

// ==========================================
// Show Registration Form
// ==========================================

addVisitorButton.addEventListener("click", function () {
  visitorFormSection.style.display = "block";

  visitorFormSection.scrollIntoView({
    behavior: "smooth",
  });
});

// ==========================================
// Cancel Visitor Form
// ==========================================

cancelVisitorButton.addEventListener("click", function () {
  visitorForm.reset();

  formMessage.style.display = "none";

  visitorFormSection.style.display = "none";
});

// ==========================================
// Show Form Message
// ==========================================

function showFormMessage(message, type) {
  formMessage.textContent = message;

  formMessage.style.display = "block";

  if (type === "success") {
    formMessage.style.backgroundColor = "#e5f5ec";

    formMessage.style.color = "#17613d";
  } else {
    formMessage.style.backgroundColor = "#ffe5e5";

    formMessage.style.color = "#c62828";
  }
}

// ==========================================
// Create Visitor Invitation
// ==========================================

visitorForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // --------------------------------------
  // Get Form Values
  // --------------------------------------

  const visitorName = document.getElementById("visitorNameInput").value.trim();

  const mobile = document.getElementById("visitorMobile").value.trim();

  const vehicle = document.getElementById("vehicleNumber").value.trim();

  const visitDate = document.getElementById("visitDate").value;

  const expectedTime = document.getElementById("expectedTimeInput").value;

  const purposeSelect = document.getElementById("visitPurpose");

  const purpose = purposeSelect.options[purposeSelect.selectedIndex].text;

  const purposeValue = purposeSelect.value;

  const validTill = document.getElementById("validTillInput").value;

  const today = getTodayDate();

  // --------------------------------------
  // Validate Visit Date
  // --------------------------------------

  if (!visitDate) {
    showFormMessage("Please select the visit date.", "error");

    return;
  }

  if (visitDate < today) {
    showFormMessage("Visit date cannot be in the past.", "error");

    return;
  }

  // --------------------------------------
  // Validate Mobile Number
  // --------------------------------------

  if (!/^[0-9]{10}$/.test(mobile)) {
    showFormMessage("Please enter a valid 10-digit mobile number.", "error");

    return;
  }

  // --------------------------------------
  // Validate Expected Time
  // --------------------------------------

  if (!expectedTime) {
    showFormMessage("Please select the expected time.", "error");

    return;
  }

  // --------------------------------------
  // Validate Purpose
  // --------------------------------------

  if (!purposeValue) {
    showFormMessage("Please select the visit purpose.", "error");

    return;
  }

  // --------------------------------------
  // Validate Valid Till
  // --------------------------------------

  if (!validTill) {
    showFormMessage("Please select the valid till time.", "error");

    return;
  }

  if (validTill <= expectedTime) {
    showFormMessage(
      "Valid Till time must be later than Expected Time.",
      "error",
    );

    return;
  }

  // --------------------------------------
  // Generate OTP
  // --------------------------------------

  const otp = generateOTP();

  // --------------------------------------
  // Disable Submit Button
  // --------------------------------------

  const submitButton = visitorForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    // ------------------------------------
    // Send Visitor to Backend
    // ------------------------------------

    const response = await fetch(`${API_URL}/api/visitors`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user_id: user.id,

        visitor_name: visitorName,

        mobile: mobile,

        vehicle: vehicle || null,

        visit_date: visitDate,

        expected_time: expectedTime,

        purpose: purpose,

        valid_till: validTill,

        otp: otp,
      }),
    });

    const data = await response.json();

    // ------------------------------------
    // Handle Server Error
    // ------------------------------------

    if (!response.ok) {
      throw new Error(data.message || "Unable to create visitor invitation.");
    }

    // ------------------------------------
    // Create Local Invitation Object
    // ------------------------------------

    const newVisitor = {
      id: data.visitorId,

      name: visitorName,

      mobile: mobile,

      vehicle: vehicle,

      visitDate: visitDate,

      expectedTime: expectedTime,

      purpose: purpose,

      validTill: validTill,

      otp: otp,

      status: "upcoming",
    };

    // ------------------------------------
    // Display Active Invitation
    // ------------------------------------

    displayInvitation(newVisitor);

    // ------------------------------------
    // Reload Visitor History
    // ------------------------------------

    await loadVisitors();

    // ------------------------------------
    // Success Message
    // ------------------------------------

    showFormMessage("Visitor invitation generated successfully.", "success");

    // ------------------------------------
    // Reset Form
    // ------------------------------------

    visitorForm.reset();

    // ------------------------------------
    // Hide Form
    // ------------------------------------

    visitorFormSection.style.display = "none";

    // ------------------------------------
    // Scroll to Invitation
    // ------------------------------------

    activeInvitation.scrollIntoView({
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Create visitor error:", error);

    showFormMessage(
      error.message || "Unable to create visitor invitation.",
      "error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

// ==========================================
// Copy OTP
// ==========================================

copyOtpButton.addEventListener("click", function () {
  const otp = document.getElementById("otpCode").textContent;

  navigator.clipboard
    .writeText(otp)

    .then(function () {
      copyOtpButton.textContent = "Copied!";

      setTimeout(function () {
        copyOtpButton.textContent = "Copy OTP";
      }, 1500);
    })

    .catch(function () {
      copyOtpButton.textContent = "Copy Failed";
    });
});

// ==========================================
// Close Invitation Modal
// ==========================================

function closeModal() {
  invitationModal.style.display = "none";
}

closeInvitationModal.addEventListener("click", closeModal);

closeInvitationButton.addEventListener("click", closeModal);

invitationModal.addEventListener("click", function (event) {
  if (event.target === invitationModal) {
    closeModal();
  }
});

// ==========================================
// Load Visitor Records
// When Page Loads
// ==========================================

loadVisitors();
