// ==========================================
// TownCare - Lost & Found
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
// Lost & Found Records
//
// These records now come from MySQL.
// ==========================================

let items = [];

// ==========================================
// Get HTML Elements
// ==========================================

const reportItemBtn = document.getElementById("reportItemBtn");

const reportFormSection = document.getElementById("reportFormSection");

const cancelReportBtn = document.getElementById("cancelReportBtn");

const lostFoundForm = document.getElementById("lostFoundForm");

const itemType = document.getElementById("itemType");

const itemName = document.getElementById("itemName");

const itemLocation = document.getElementById("itemLocation");

const itemDate = document.getElementById("itemDate");

const itemDescription = document.getElementById("itemDescription");

const itemPhoto = document.getElementById("itemPhoto");

const imagePreview = document.getElementById("imagePreview");

const itemsList = document.getElementById("itemsList");

const noItems = document.getElementById("noItems");

const itemModal = document.getElementById("itemModal");

const closeModal = document.getElementById("closeModal");

const modalImage = document.getElementById("modalImage");

const modalType = document.getElementById("modalType");

const modalItemName = document.getElementById("modalItemName");

const modalLocation = document.getElementById("modalLocation");

const modalDate = document.getElementById("modalDate");

const modalReportedBy = document.getElementById("modalReportedBy");

const modalDescription = document.getElementById("modalDescription");

// ==========================================
// Set Today's Date as Maximum Date
// ==========================================

const today = new Date().toISOString().split("T")[0];

itemDate.max = today;

// ==========================================
// Show Report Form
// ==========================================

reportItemBtn.addEventListener("click", function () {
  reportFormSection.style.display = "block";

  reportFormSection.scrollIntoView({
    behavior: "smooth",
  });
});

// ==========================================
// Hide Report Form
// ==========================================

cancelReportBtn.addEventListener("click", function () {
  reportFormSection.style.display = "none";

  clearForm();
});

// ==========================================
// Image Preview
// ==========================================

itemPhoto.addEventListener("change", function () {
  imagePreview.innerHTML = "";

  const file = itemPhoto.files[0];

  if (!file) {
    return;
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    document.getElementById("itemPhotoError").textContent =
      "Please select a JPG, JPEG or PNG image.";

    itemPhoto.value = "";

    return;
  }

  document.getElementById("itemPhotoError").textContent = "";

  const reader = new FileReader();

  reader.onload = function (event) {
    const image = document.createElement("img");

    image.src = event.target.result;

    image.alt = "Selected Item Photo";

    imagePreview.appendChild(image);
  };

  reader.readAsDataURL(file);
});

// ==========================================
// Load Lost & Found Records from MySQL
// ==========================================

async function loadItems() {
  try {
    const response = await fetch(`${API_URL}/api/lost-found`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load Lost & Found records.");
    }

    items = data.items.map(function (item) {
      return {
        id: item.id,

        type: item.type,

        name: item.item_name,

        location: item.location,

        date: item.item_date,

        description: item.description,

        photo: item.photo || "",

        reportedBy: `${item.username} - ${item.house_no}`,
      };
    });

    displayItems();
  } catch (error) {
    console.error("Load Lost & Found error:", error);

    items = [];

    displayItems();

    alert("Unable to load Lost & Found records from the server.");
  }
}

// ==========================================
// Form Submission
// ==========================================

lostFoundForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  createItem();
});

// ==========================================
// Validate Form
// ==========================================

function validateForm() {
  let isValid = true;

  clearErrors();

  // --------------------------------------
  // Item Type
  // --------------------------------------

  if (itemType.value === "") {
    document.getElementById("itemTypeError").textContent =
      "Please select Lost or Found.";

    isValid = false;
  }

  // --------------------------------------
  // Item Name
  // --------------------------------------

  if (itemName.value.trim() === "") {
    document.getElementById("itemNameError").textContent =
      "Please enter the item name.";

    isValid = false;
  }

  // --------------------------------------
  // Location
  // --------------------------------------

  if (itemLocation.value.trim() === "") {
    document.getElementById("itemLocationError").textContent =
      "Please enter the location.";

    isValid = false;
  }

  // --------------------------------------
  // Date
  // --------------------------------------

  if (itemDate.value === "") {
    document.getElementById("itemDateError").textContent =
      "Please select the date.";

    isValid = false;
  } else if (itemDate.value > today) {
    document.getElementById("itemDateError").textContent =
      "Date cannot be in the future.";

    isValid = false;
  }

  // --------------------------------------
  // Description
  // --------------------------------------

  if (itemDescription.value.trim() === "") {
    document.getElementById("itemDescriptionError").textContent =
      "Please provide a description.";

    isValid = false;
  }

  // --------------------------------------
  // Photo
  // --------------------------------------

  if (itemPhoto.files.length > 0) {
    const file = itemPhoto.files[0];

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      document.getElementById("itemPhotoError").textContent =
        "Only JPG, JPEG and PNG images are allowed.";

      isValid = false;
    }
  }

  return isValid;
}

// ==========================================
// Create New Lost & Found Item
// ==========================================

async function createItem() {
  // --------------------------------------
  // Get Form Values
  // --------------------------------------

  const type = itemType.value;

  const name = itemName.value.trim();

  const location = itemLocation.value.trim();

  const date = itemDate.value;

  const description = itemDescription.value.trim();

  // --------------------------------------
  // Disable Submit Button
  // --------------------------------------

  const submitButton = lostFoundForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    // ----------------------------------
    // Prepare Form Data
    // ----------------------------------

    const formData = new FormData();

    formData.append("user_id", user.id);

    formData.append("type", type);

    formData.append("item_name", name);

    formData.append("location", location);

    formData.append("item_date", date);

    formData.append("description", description);

    // ----------------------------------
    // Add Photo
    // ----------------------------------

    const file = itemPhoto.files[0];

    if (file) {
      formData.append("photo", file);
    }

    // ----------------------------------
    // Send Record to Backend
    // ----------------------------------

    const response = await fetch(`${API_URL}/api/lost-found`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // ----------------------------------
    // Handle Server Error
    // ----------------------------------

    if (!response.ok) {
      throw new Error(data.message || "Unable to submit Lost & Found record.");
    }

    // ----------------------------------
    // Reset Form
    // ----------------------------------

    clearForm();

    // ----------------------------------
    // Hide Form
    // ----------------------------------

    reportFormSection.style.display = "none";

    // ----------------------------------
    // Reload Records from MySQL
    // ----------------------------------

    await loadItems();

    // ----------------------------------
    // Show Success Message
    // ----------------------------------

    alert("Lost & Found record submitted successfully.");

    // ----------------------------------
    // Scroll to Records
    // ----------------------------------

    document.querySelector(".records-section").scrollIntoView({
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Create Lost & Found error:", error);

    alert(error.message || "Unable to submit Lost & Found record.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

// ==========================================
// Display Items
// ==========================================

function displayItems() {
  itemsList.innerHTML = "";

  if (items.length === 0) {
    noItems.style.display = "block";

    return;
  }

  noItems.style.display = "none";

  items.forEach(function (item) {
    const card = document.createElement("div");

    card.className = "item-card";

    let imageHTML = "";

    if (item.photo) {
      const photoUrl = item.photo.startsWith("http")
        ? item.photo
        : `${API_URL}${item.photo}`;

      imageHTML = `
        <img
            src="${photoUrl}"
            alt="${item.name}"
            class="item-card-image"
        >
    `;
    }

    card.innerHTML = `

                ${imageHTML}


                <div class="item-card-top">

                    <div>

                        <h3>
                            ${item.name}
                        </h3>

                        <p class="item-date">
                            ${formatDate(item.date)}
                        </p>

                    </div>


                    <span
                        class="item-type ${item.type.toLowerCase()}"
                    >
                        ${item.type}
                    </span>

                </div>


                <div class="item-card-info">


                    <div class="item-info-box">

                        <span>
                            Location
                        </span>

                        <strong>
                            ${item.location}
                        </strong>

                    </div>


                    <div class="item-info-box">

                        <span>
                            Reported By
                        </span>

                        <strong>
                            ${item.reportedBy}
                        </strong>

                    </div>


                </div>


                <p class="item-description">
                    ${item.description}
                </p>


                <button
                    class="view-details-btn"
                    onclick="viewItemDetails(${item.id})"
                >
                    View Details
                </button>

            `;

    itemsList.appendChild(card);
  });
}

// ==========================================
// View Item Details
// ==========================================

function viewItemDetails(id) {
  const item = items.find(function (record) {
    return record.id === id;
  });

  if (!item) {
    return;
  }

  modalType.textContent = item.type;

  modalType.className = "item-type " + item.type.toLowerCase();

  modalItemName.textContent = item.name;

  modalLocation.textContent = item.location;

  modalDate.textContent = formatDate(item.date);

  modalReportedBy.textContent = item.reportedBy;

  modalDescription.textContent = item.description;

  // --------------------------------------
  // Display Image Only When Available
  // --------------------------------------

  if (item.photo) {
    const photoUrl = item.photo.startsWith("http")
      ? item.photo
      : `${API_URL}${item.photo}`;

    modalImage.src = photoUrl;

    modalImage.alt = item.name;

    modalImage.style.display = "block";
  } else {
    modalImage.src = "";

    modalImage.style.display = "none";
  }

  itemModal.style.display = "flex";
}

// ==========================================
// Close Modal
// ==========================================

closeModal.addEventListener("click", function () {
  itemModal.style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target === itemModal) {
    itemModal.style.display = "none";
  }
});

// ==========================================
// Format Date
// ==========================================

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString + "T00:00:00");

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// Clear Form
// ==========================================

function clearForm() {
  lostFoundForm.reset();

  imagePreview.innerHTML = "";

  clearErrors();

  itemDate.max = today;
}

// ==========================================
// Clear Error Messages
// ==========================================

function clearErrors() {
  document.getElementById("itemTypeError").textContent = "";

  document.getElementById("itemNameError").textContent = "";

  document.getElementById("itemLocationError").textContent = "";

  document.getElementById("itemDateError").textContent = "";

  document.getElementById("itemDescriptionError").textContent = "";

  document.getElementById("itemPhotoError").textContent = "";
}

// ==========================================
// Load Records When Page Opens
// ==========================================

loadItems();
