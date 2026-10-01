// ==========================================
// TownCare - Admin Complaints & Services
// ==========================================

const API_URL = "http://localhost:3000";

// ==========================================
// Elements
// ==========================================

const adminInitials = document.getElementById("adminInitials");

const totalComplaints = document.getElementById("totalComplaints");

const pendingComplaints = document.getElementById("pendingComplaints");

const progressComplaints = document.getElementById("progressComplaints");

const resolvedComplaints = document.getElementById("resolvedComplaints");

const complaintSearch = document.getElementById("complaintSearch");

const statusFilter = document.getElementById("statusFilter");

const complaintList = document.getElementById("complaintList");

const errorMessage = document.getElementById("errorMessage");

const successMessage = document.getElementById("successMessage");

const logoutLink = document.getElementById("logoutLink");

// ==========================================
// Complaint Data
// ==========================================

let complaints = [];

// ==========================================
// Authentication Check
// ==========================================

const storedAdmin = localStorage.getItem("towncareAdmin");

if (!storedAdmin) {
  window.location.href = "login.html";
} else {
  try {
    const admin = JSON.parse(storedAdmin);

    if (!admin || admin.role !== "admin") {
      localStorage.removeItem("towncareAdmin");

      window.location.href = "login.html";
    } else {
      displayAdminInitials(admin);

      loadComplaints();
    }
  } catch (error) {
    console.error("Admin session error:", error);

    localStorage.removeItem("towncareAdmin");

    window.location.href = "login.html";
  }
}

// ==========================================
// Display Admin Initials
// ==========================================

function displayAdminInitials(admin) {
  const name = admin.username || "Administrator";

  adminInitials.textContent = getInitials(name);
}

// ==========================================
// Generate Initials
// ==========================================

function getInitials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "AD";
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// ==========================================
// Load Complaints
// ==========================================

async function loadComplaints() {
  showLoadingState();

  clearMessages();

  try {
    const response = await fetch(`${API_URL}/api/admin/complaints`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to retrieve complaints.");
    }

    complaints = Array.isArray(data)
      ? data
      : Array.isArray(data.complaints)
        ? data.complaints
        : [];

    updateStatistics();

    applyFilters();
  } catch (error) {
    console.error("Complaints API error:", error);

    showError(
      error.message ||
        "Unable to load complaints. Make sure the TownCare backend is running.",
    );

    complaintList.innerHTML = `<div class="empty-state">
                Unable to load complaints.
            </div>`;
  }
}

// ==========================================
// Update Statistics
// ==========================================

function updateStatistics() {
  const total = complaints.length;

  const pending = complaints.filter(
    (complaint) => complaint.status === "Pending",
  ).length;

  const inProgress = complaints.filter(
    (complaint) => complaint.status === "In Progress",
  ).length;

  const resolved = complaints.filter(
    (complaint) => complaint.status === "Resolved",
  ).length;

  totalComplaints.textContent = formatNumber(total);

  pendingComplaints.textContent = formatNumber(pending);

  progressComplaints.textContent = formatNumber(inProgress);

  resolvedComplaints.textContent = formatNumber(resolved);
}

// ==========================================
// Number Formatting
// ==========================================

function formatNumber(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
}

// ==========================================
// Search + Filter
// ==========================================

function applyFilters() {
  const searchTerm = complaintSearch.value.trim().toLowerCase();

  const selectedStatus = statusFilter.value;

  const filteredComplaints = complaints.filter((complaint) => {
    const residentName = String(complaint.username || "").toLowerCase();

    const houseNo = String(complaint.house_no || "").toLowerCase();

    const phoneNo = String(complaint.phone_no || "").toLowerCase();

    const category = String(complaint.category || "").toLowerCase();

    const location = String(complaint.location || "").toLowerCase();

    const description = String(complaint.description || "").toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      residentName.includes(searchTerm) ||
      houseNo.includes(searchTerm) ||
      phoneNo.includes(searchTerm) ||
      category.includes(searchTerm) ||
      location.includes(searchTerm) ||
      description.includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || complaint.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderComplaints(filteredComplaints);
}

// ==========================================
// Render Complaints
// ==========================================

function renderComplaints(complaintRecords) {
  if (!Array.isArray(complaintRecords) || complaintRecords.length === 0) {
    complaintList.innerHTML = `<div class="empty-state">
                No complaints found.
            </div>`;

    return;
  }

  complaintList.innerHTML = complaintRecords
    .map((complaint) => createComplaintCard(complaint))
    .join("");
}

// ==========================================
// Create Complaint Card
// ==========================================

function createComplaintCard(complaint) {
  const status = complaint.status || "Pending";

  const statusClass = getStatusClass(status);

  const providerName = complaint.provider_name || "";

  const providerPhone = complaint.provider_phone || "";

  return `
        <article class="complaint-card">

            <!-- Complaint Header -->

            <div class="complaint-top">

                <div class="complaint-heading">

                    <div class="complaint-category">
                        ${escapeHTML(complaint.category || "Complaint")}
                    </div>

                    <div class="complaint-id">
                        Complaint ID:
                        #${escapeHTML(complaint.id)}
                    </div>

                </div>


                <span
                    class="complaint-status ${statusClass}"
                >
                    ${escapeHTML(status)}
                </span>

            </div>


            <!-- Complaint Details -->

            <div class="complaint-details">

                <div class="detail-item">

                    <div class="detail-label">
                        Resident
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(complaint.username || "N/A")}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        House Number
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(complaint.house_no || "N/A")}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Mobile Number
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(complaint.phone_no || "N/A")}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Location
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(complaint.location || "N/A")}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Submitted On
                    </div>

                    <div class="detail-value">
                        ${formatDate(complaint.created_at)}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Provider
                    </div>

                    <div class="detail-value">

                        ${
                          providerName
                            ? escapeHTML(providerName)
                            : "Not Assigned"
                        }

                    </div>

                </div>

            </div>


            <!-- Complaint Description -->

            <div class="complaint-description">

                <div class="detail-label">
                    Description
                </div>

                <div class="description-text">
                    ${escapeHTML(
                      complaint.description || "No description available.",
                    )}
                </div>

            </div>

            // ==========================================
// Complaint Photo
// ==========================================

${
  complaint.photo
    ? `
            <div class="complaint-photo-section">

                <div class="detail-label">
                    Complaint Photo
                </div>

                <img
                    src="${
                      complaint.photo.startsWith("http")
                        ? complaint.photo
                        : `${API_URL}${complaint.photo}`
                    }"
                    alt="Complaint photo"
                    class="complaint-photo"
                >

            </div>
        `
    : ""
}


            <!-- Resident Information -->

            <div class="resident-information">

                <div class="resident-information-title">
                    Resident Information
                </div>

                <div class="resident-information-details">

                    <span>
                        Name:
                        <strong>
                            ${escapeHTML(complaint.username || "N/A")}
                        </strong>
                    </span>

                    <span>
                        House:
                        <strong>
                            ${escapeHTML(complaint.house_no || "N/A")}
                        </strong>
                    </span>

                    <span>
                        Mobile:
                        <strong>
                            ${escapeHTML(complaint.phone_no || "N/A")}
                        </strong>
                    </span>

                </div>

            </div>


            ${
              providerName || providerPhone
                ? `
                        <div class="provider-info">

                            <span>
                                Provider:
                                <strong>
                                    ${escapeHTML(providerName || "N/A")}
                                </strong>
                            </span>

                            <span>
                                Phone:
                                <strong>
                                    ${escapeHTML(providerPhone || "N/A")}
                                </strong>
                            </span>

                        </div>
                    `
                : ""
            }


            <!-- Provider Update Form -->

            <div
                class="provider-section"
                data-complaint-id="${escapeAttribute(complaint.id)}"
            >

                <div class="provider-field">

                    <label
                        for="providerName-${escapeAttribute(complaint.id)}"
                    >
                        Service Provider
                    </label>

                    <input
                        type="text"
                        id="providerName-${escapeAttribute(complaint.id)}"
                        class="provider-name-input"
                        value="${escapeAttribute(providerName)}"
                        placeholder="Enter provider name"
                        maxlength="100"
                        autocomplete="off"
                    />

                </div>


                <div class="provider-field">

                    <label
                        for="providerPhone-${escapeAttribute(complaint.id)}"
                    >
                        Provider Mobile
                    </label>

                    <input
                        type="tel"
                        id="providerPhone-${escapeAttribute(complaint.id)}"
                        class="provider-phone-input"
                        value="${escapeAttribute(providerPhone)}"
                        placeholder="Enter 10-digit mobile"
                        maxlength="10"
                        inputmode="numeric"
                        autocomplete="off"
                    />

                </div>


                <div class="provider-field">

                    <label
                        for="status-${escapeAttribute(complaint.id)}"
                    >
                        Status
                    </label>

                    <select
                        id="status-${escapeAttribute(complaint.id)}"
                        class="status-select"
                    >

                        ${createStatusOptions(status)}

                    </select>

                </div>


                <button
                    type="button"
                    class="update-button"
                    data-action="update"
                    data-id="${escapeAttribute(complaint.id)}"
                >
                    Update Complaint
                </button>

            </div>

        </article>
    `;
}

// ==========================================
// Create Status Options
// ==========================================

function createStatusOptions(currentStatus) {
  const statuses = ["Pending", "Assigned", "In Progress", "Resolved"];

  return statuses
    .map((status) => {
      return `
                    <option
                        value="${escapeAttribute(status)}"
                        ${status === currentStatus ? "selected" : ""}
                    >
                        ${escapeHTML(status)}
                    </option>
                `;
    })
    .join("");
}

// ==========================================
// Status CSS Class
// ==========================================

function getStatusClass(status) {
  switch (status) {
    case "Pending":
      return "pending";

    case "Assigned":
      return "assigned";

    case "In Progress":
      return "progress";

    case "Resolved":
      return "resolved";

    default:
      return "pending";
  }
}

// ==========================================
// Update Complaint
// ==========================================

async function updateComplaint(complaintId, container, button) {
  if (!complaintId) {
    showError("Invalid complaint ID.");

    return;
  }

  const providerNameInput = container.querySelector(".provider-name-input");

  const providerPhoneInput = container.querySelector(".provider-phone-input");

  const statusSelect = container.querySelector(".status-select");

  const providerName = providerNameInput.value.trim();

  const providerPhone = providerPhoneInput.value.trim();

  const status = statusSelect.value;

  // ======================================
  // Validate Provider Name
  // ======================================

  if (providerName !== "" && !/^[a-zA-Z\s.'-]{2,100}$/.test(providerName)) {
    showError("Please enter a valid service provider name.");

    providerNameInput.focus();

    return;
  }

  // ======================================
  // Validate Provider Phone
  // ======================================

  if (providerPhone !== "" && !/^[0-9]{10}$/.test(providerPhone)) {
    showError("Please enter a valid 10-digit provider mobile number.");

    providerPhoneInput.focus();

    return;
  }

  // ======================================
  // Status Validation
  // ======================================

  const validStatuses = ["Pending", "Assigned", "In Progress", "Resolved"];

  if (!validStatuses.includes(status)) {
    showError("Please select a valid complaint status.");

    return;
  }

  // ======================================
  // Provider Requirement
  // ======================================

  if (
    (status === "Assigned" || status === "In Progress") &&
    (providerName === "" || providerPhone === "")
  ) {
    showError(
      "Provider name and mobile number are required for assigned or in-progress complaints.",
    );

    return;
  }

  clearMessages();

  const originalText = button.textContent;

  button.disabled = true;

  button.textContent = "Updating...";

  try {
    const response = await fetch(
      `${API_URL}/api/admin/complaints/${encodeURIComponent(complaintId)}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          provider_name: providerName || null,

          provider_phone: providerPhone || null,

          status: status,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update complaint.");
    }

    showSuccess(data.message || "Complaint updated successfully.");

    await loadComplaints();
  } catch (error) {
    console.error("Complaint update error:", error);

    showError(error.message || "Unable to update complaint.");

    button.disabled = false;

    button.textContent = originalText;
  }
}

// ==========================================
// Complaint List Click Handler
// ==========================================

complaintList.addEventListener("click", function (event) {
  const button = event.target.closest('[data-action="update"]');

  if (!button) {
    return;
  }

  const complaintId = button.dataset.id;

  const container = button.closest(".provider-section");

  if (!container) {
    showError("Unable to find complaint update section.");

    return;
  }

  updateComplaint(complaintId, container, button);
});

// ==========================================
// Search Event
// ==========================================

complaintSearch.addEventListener("input", function () {
  applyFilters();
});

// ==========================================
// Status Filter Event
// ==========================================

statusFilter.addEventListener("change", function () {
  applyFilters();
});

// ==========================================
// Date Formatting
// ==========================================

function formatDate(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// HTML Safety
// ==========================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// Attribute Safety
// ==========================================

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ==========================================
// Loading State
// ==========================================

function showLoadingState() {
  complaintList.innerHTML = `<div class="loading-state">
            Loading complaints...
        </div>`;
}

// ==========================================
// Error Message
// ==========================================

function showError(message) {
  errorMessage.textContent = message;

  errorMessage.style.display = "block";

  successMessage.textContent = "";

  successMessage.style.display = "none";
}

// ==========================================
// Success Message
// ==========================================

function showSuccess(message) {
  successMessage.textContent = message;

  successMessage.style.display = "block";

  errorMessage.textContent = "";

  errorMessage.style.display = "none";
}

// ==========================================
// Clear Messages
// ==========================================

function clearMessages() {
  errorMessage.textContent = "";

  errorMessage.style.display = "none";

  successMessage.textContent = "";

  successMessage.style.display = "none";
}

// ==========================================
// Logout
// ==========================================

logoutLink.addEventListener("click", function (event) {
  event.preventDefault();

  localStorage.removeItem("towncareAdmin");

  window.location.href = "login.html";
});
