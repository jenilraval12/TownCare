// ==========================================
// TownCare - Complaints
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

const newComplaintButton = document.getElementById("newComplaintButton");

const complaintFormSection = document.getElementById("complaintFormSection");

const complaintForm = document.getElementById("complaintForm");

const complaintCategory = document.getElementById("complaintCategory");

const complaintLocation = document.getElementById("complaintLocation");

const otherLocationGroup = document.getElementById("otherLocationGroup");

const otherLocation = document.getElementById("otherLocation");

const complaintPhoto = document.getElementById("complaintPhoto");

const photoPreviewSection = document.getElementById("photoPreviewSection");

const photoPreview = document.getElementById("photoPreview");

const formMessage = document.getElementById("formMessage");

const cancelComplaintButton = document.getElementById("cancelComplaintButton");

const complaintList = document.getElementById("complaintList");

const noComplaints = document.getElementById("noComplaints");

const complaintModal = document.getElementById("complaintModal");

const closeComplaintModal = document.getElementById("closeComplaintModal");

const closeComplaintButton = document.getElementById("closeComplaintButton");

const modalComplaintId = document.getElementById("modalComplaintId");

const modalComplaintTitle = document.getElementById("modalComplaintTitle");

const modalStatus = document.getElementById("modalStatus");

const modalCategory = document.getElementById("modalCategory");

const modalLocation = document.getElementById("modalLocation");

const modalDate = document.getElementById("modalDate");

const modalProvider = document.getElementById("modalProvider");

const modalProviderPhone = document.getElementById("modalProviderPhone");

const modalDescription = document.getElementById("modalDescription");

const modalPhotoSection = document.getElementById("modalPhotoSection");

const modalPhoto = document.getElementById("modalPhoto");

// ==========================================
// Complaints
//
// These records now come from MySQL.
// ==========================================

let complaints = [];

// ==========================================
// Format Date
// ==========================================

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  let date;

  // MySQL timestamp
  if (dateString.includes("T") || dateString.includes(" ")) {
    date = new Date(dateString.replace(" ", "T"));
  } else {
    // Normal YYYY-MM-DD date
    date = new Date(dateString + "T00:00:00");
  }

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
// Convert Status into CSS Class
// ==========================================

function getStatusClass(status) {
  if (status === "Pending") {
    return "pending";
  }

  if (status === "Assigned") {
    return "assigned";
  }

  if (status === "In Progress") {
    return "progress";
  }

  if (status === "Resolved") {
    return "resolved";
  }

  return "";
}

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
// Load Complaints from MySQL
// ==========================================

async function loadComplaints() {
  try {
    const response = await fetch(`${API_URL}/api/complaints/${user.id}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load complaints.");
    }

    complaints = data.complaints.map(function (complaint) {
      return {
        id: complaint.id,

        category: complaint.category,

        location: complaint.location,

        description: complaint.description,

        date: complaint.created_at,

        provider: complaint.provider_name
          ? {
              name: complaint.provider_name,
              phone: complaint.provider_phone || "",
            }
          : null,

        status: complaint.status,

        photo: complaint.photo || null,
      };
    });

    displayComplaints();
  } catch (error) {
    console.error("Load complaints error:", error);

    complaints = [];

    displayComplaints();

    showFormMessage("Unable to load complaints from the server.", "error");
  }
}

// ==========================================
// Show Complaint Form
// ==========================================

newComplaintButton.addEventListener("click", function () {
  complaintFormSection.style.display = "block";

  complaintFormSection.scrollIntoView({
    behavior: "smooth",
  });
});

// ==========================================
// Show or Hide Other Location
// ==========================================

complaintLocation.addEventListener("change", function () {
  if (complaintLocation.value === "Other") {
    otherLocationGroup.style.display = "flex";

    otherLocation.required = true;
  } else {
    otherLocationGroup.style.display = "none";

    otherLocation.required = false;

    otherLocation.value = "";
  }
});

// ==========================================
// Complaint Photo Preview
// ==========================================

complaintPhoto.addEventListener("change", function () {
  const file = complaintPhoto.files[0];

  if (!file) {
    photoPreviewSection.style.display = "none";

    photoPreview.src = "";

    return;
  }

  if (!file.type.startsWith("image/")) {
    formMessage.textContent = "Please select an image file.";

    formMessage.style.display = "block";

    formMessage.style.backgroundColor = "#ffe5e5";

    formMessage.style.color = "#c62828";

    complaintPhoto.value = "";

    photoPreviewSection.style.display = "none";

    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    photoPreview.src = event.target.result;

    photoPreviewSection.style.display = "block";
  };

  reader.readAsDataURL(file);
});

// ==========================================
// Display Complaints
// ==========================================

function displayComplaints() {
  complaintList.innerHTML = "";

  if (complaints.length === 0) {
    noComplaints.style.display = "block";

    return;
  }

  noComplaints.style.display = "none";

  complaints.forEach(function (complaint) {
    const complaintCard = document.createElement("article");

    complaintCard.className = "complaint-card";

    const statusClass = getStatusClass(complaint.status);

    let providerName = "Not Assigned";

    let providerPhone = "";

    if (complaint.provider) {
      providerName = complaint.provider.name;

      providerPhone = complaint.provider.phone;
    }

    const description =
      complaint.description.length > 100
        ? complaint.description.substring(0, 100) + "..."
        : complaint.description;

    complaintCard.innerHTML = `

        <div class="complaint-card-header">

          <div>

            <div class="complaint-id">
              Complaint #${complaint.id}
            </div>

            <div class="complaint-card-title">
              ${complaint.category}
            </div>

            <div class="complaint-date">
              Submitted:
              ${formatDate(complaint.date)}
            </div>

          </div>


          <span
            class="complaint-status ${statusClass}"
          >
            ${complaint.status}
          </span>

        </div>


        <div class="complaint-card-details">

          <div class="complaint-detail">

            <span>
              Location
            </span>

            <span>
              ${complaint.location}
            </span>

          </div>


          <div class="complaint-detail">

            <span>
              Service Provider
            </span>

            <span>
              ${providerName}
            </span>

          </div>


          ${
            providerPhone
              ? `
                <div class="complaint-detail">

                  <span>
                    Provider Mobile
                  </span>

                  <span>
                    ${providerPhone}
                  </span>

                </div>
              `
              : ""
          }

        </div>


        <p class="complaint-description">
          ${description}
        </p>


        <button
          type="button"
          class="view-details-button"
          data-id="${complaint.id}"
        >
          View Details
        </button>

      `;

    complaintList.appendChild(complaintCard);
  });
}

// ==========================================
// Submit New Complaint
// ==========================================

complaintForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const category = complaintCategory.value;

  const selectedLocation = complaintLocation.value;

  const description = document
    .getElementById("complaintDescription")
    .value.trim();

  let finalLocation = selectedLocation;

  // --------------------------------------
  // Other Location
  // --------------------------------------

  if (selectedLocation === "Other") {
    finalLocation = otherLocation.value.trim();

    if (!finalLocation) {
      showFormMessage("Please specify the location.", "error");

      return;
    }
  }

  // --------------------------------------
  // Basic Validation
  // --------------------------------------

  if (!category) {
    showFormMessage("Please select a complaint category.", "error");

    return;
  }

  if (!selectedLocation) {
    showFormMessage("Please select a location.", "error");

    return;
  }

  if (!description) {
    showFormMessage("Please provide a complaint description.", "error");

    return;
  }

  // --------------------------------------
  // Photo
  // --------------------------------------

  const photoFile = complaintPhoto.files[0];

  // --------------------------------------
  // Prevent Duplicate Submission
  // --------------------------------------

  const submitButton = complaintForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    // ------------------------------------
    // Prepare Complaint Data
    // ------------------------------------

    const formData = new FormData();

    formData.append("user_id", user.id);

    formData.append("category", category);

    formData.append("location", finalLocation);

    formData.append("description", description);

    // ------------------------------------
    // Add Complaint Photo
    // ------------------------------------

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    // ------------------------------------
    // Send Complaint to Backend
    // ------------------------------------

    const response = await fetch(`${API_URL}/api/complaints`, {
      method: "POST",

      body: formData,
    });

    const data = await response.json();

    // ------------------------------------
    // Handle Server Error
    // ------------------------------------

    if (!response.ok) {
      throw new Error(data.message || "Unable to submit complaint.");
    }

    // ------------------------------------
    // Reset Form
    // ------------------------------------

    complaintForm.reset();

    otherLocationGroup.style.display = "none";

    otherLocation.required = false;

    photoPreviewSection.style.display = "none";

    photoPreview.src = "";

    // ------------------------------------
    // Reload Complaints from Database
    // ------------------------------------

    await loadComplaints();

    // ------------------------------------
    // Success Message
    // ------------------------------------

    showFormMessage("Complaint submitted successfully.", "success");

    // ------------------------------------
    // Hide Form
    // ------------------------------------

    complaintFormSection.style.display = "none";

    // ------------------------------------
    // Scroll to Complaint List
    // ------------------------------------

    window.scrollTo({
      top: complaintList.offsetTop - 100,

      behavior: "smooth",
    });
  } catch (error) {
    console.error("Submit complaint error:", error);

    showFormMessage(error.message || "Unable to submit complaint.", "error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

// ==========================================
// Cancel Complaint Form
// ==========================================

cancelComplaintButton.addEventListener("click", function () {
  complaintForm.reset();

  otherLocationGroup.style.display = "none";

  otherLocation.required = false;

  photoPreviewSection.style.display = "none";

  photoPreview.src = "";

  formMessage.style.display = "none";

  complaintFormSection.style.display = "none";
});

// ==========================================
// Open Complaint Details
// ==========================================

function openComplaint(complaintId) {
  const complaint = complaints.find(function (item) {
    return item.id === complaintId;
  });

  if (!complaint) {
    return;
  }

  modalComplaintId.textContent = "Complaint #" + complaint.id;

  modalComplaintTitle.textContent = complaint.category + " Issue";

  modalStatus.textContent = complaint.status;

  modalStatus.className =
    "complaint-status " + getStatusClass(complaint.status);

  modalCategory.textContent = complaint.category;

  modalLocation.textContent = complaint.location;

  modalDate.textContent = formatDate(complaint.date);

  if (complaint.provider) {
    modalProvider.textContent = complaint.provider.name;

    modalProviderPhone.textContent = complaint.provider.phone;
  } else {
    modalProvider.textContent = "Not Assigned";

    modalProviderPhone.textContent = "";
  }

  modalDescription.textContent = complaint.description;

  if (complaint.photo) {
    const photoUrl = complaint.photo.startsWith("http")
      ? complaint.photo
      : `${API_URL}${complaint.photo}`;

    modalPhoto.src = photoUrl;

    modalPhotoSection.style.display = "block";
  } else {
    modalPhoto.src = "";

    modalPhotoSection.style.display = "none";
  }

  complaintModal.style.display = "flex";
}

// ==========================================
// Complaint Card Click Handling
// ==========================================

complaintList.addEventListener("click", function (event) {
  const button = event.target.closest(".view-details-button");

  if (!button) {
    return;
  }

  const complaintId = Number(button.dataset.id);

  openComplaint(complaintId);
});

// ==========================================
// Close Modal
// ==========================================

function closeModal() {
  complaintModal.style.display = "none";
}

closeComplaintModal.addEventListener("click", closeModal);

closeComplaintButton.addEventListener("click", closeModal);

// ==========================================
// Close Modal When Clicking Outside
// ==========================================

complaintModal.addEventListener("click", function (event) {
  if (event.target === complaintModal) {
    closeModal();
  }
});

// ==========================================
// Load Complaints When Page Loads
// ==========================================

loadComplaints();
