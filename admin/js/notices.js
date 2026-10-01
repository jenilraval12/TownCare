// ==========================================
// TownCare - Admin Notice Board
// ==========================================

const API_URL = "http://localhost:3000";

// ==========================================
// Check Admin Login
// ==========================================

const storedAdmin =
  localStorage.getItem("towncareAdmin") || localStorage.getItem("towncareUser");

if (!storedAdmin) {
  window.location.href = "login.html";
  throw new Error("Admin is not logged in.");
}

const admin = JSON.parse(storedAdmin);

if (admin.role && admin.role !== "admin") {
  window.location.href = "login.html";
  throw new Error("Admin access required.");
}

// ==========================================
// Get HTML Elements
// ==========================================

const adminInitials = document.getElementById("adminInitials");

const logoutLink = document.getElementById("logoutLink");

const noticeForm = document.getElementById("noticeForm");

const noticeId = document.getElementById("noticeId");

const noticeTitle = document.getElementById("noticeTitle");

const noticeCategory = document.getElementById("noticeCategory");

const noticeDescription = document.getElementById("noticeDescription");

const noticeAttachment = document.getElementById("noticeAttachment");

const formTitle = document.getElementById("formTitle");

const saveNoticeButton = document.getElementById("saveNoticeButton");

const cancelEditButton = document.getElementById("cancelEditButton");

const formErrorMessage = document.getElementById("formErrorMessage");

const formSuccessMessage = document.getElementById("formSuccessMessage");

const listErrorMessage = document.getElementById("listErrorMessage");

const listSuccessMessage = document.getElementById("listSuccessMessage");

const noticeList = document.getElementById("noticeList");

const noticeSearch = document.getElementById("noticeSearch");

const categoryFilter = document.getElementById("categoryFilter");

const totalNotices = document.getElementById("totalNotices");

const recentNotices = document.getElementById("recentNotices");

const noticeCategories = document.getElementById("noticeCategories");

const latestNoticeDate = document.getElementById("latestNoticeDate");

// ==========================================
// Notice Data
// ==========================================

let notices = [];

let isEditing = false;

// ==========================================
// Admin Initials
// ==========================================

function setAdminInitials() {
  if (!adminInitials) {
    return;
  }

  const name = admin.username || admin.name || "Admin";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(function (part) {
      return part.charAt(0).toUpperCase();
    })
    .join("");

  adminInitials.textContent = initials || "A";
}

setAdminInitials();

// ==========================================
// Format Date
// ==========================================

function formatDate(dateString) {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);

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
// Escape HTML
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
// Validate Attachment URL
// ==========================================

function safeUrl(value) {
  if (!value) {
    return "";
  }

  const url = String(value).trim();

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/uploads/")
  ) {
    return url;
  }

  return "";
}

// ==========================================
// Show / Hide Messages
// ==========================================

function showFormError(message) {
  formErrorMessage.textContent = message || "";

  formErrorMessage.style.display = message ? "block" : "none";
}

function showFormSuccess(message) {
  formSuccessMessage.textContent = message || "";

  formSuccessMessage.style.display = message ? "block" : "none";
}

function showListError(message) {
  listErrorMessage.textContent = message || "";

  listErrorMessage.style.display = message ? "block" : "none";
}

function showListSuccess(message) {
  listSuccessMessage.textContent = message || "";

  listSuccessMessage.style.display = message ? "block" : "none";
}

// ==========================================
// Normalize Backend Response
// ==========================================

function getNoticeArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.notices)) {
    return data.notices;
  }

  return [];
}

// ==========================================
// Load Notices
// ==========================================

async function loadNotices() {
  try {
    showListError("");
    showListSuccess("");

    noticeList.innerHTML = `
            <div class="loading-state">
                Loading notices...
            </div>
        `;

    const response = await fetch(`${API_URL}/api/notices`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load notices.");
    }

    notices = getNoticeArray(data);

    notices.sort(function (a, b) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    updateStatistics();

    populateCategoryFilter();

    displayNotices();
  } catch (error) {
    console.error("Error loading notices:", error);

    noticeList.innerHTML = `
            <div class="error-message">
                Unable to load notices.
                Please try again.
            </div>
        `;

    showListError(error.message || "Failed to load notices.");
  }
}

// ==========================================
// Update Statistics
// ==========================================

function updateStatistics() {
  totalNotices.textContent = notices.length;

  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCount = notices.filter(function (notice) {
    if (!notice.created_at) {
      return false;
    }

    return new Date(notice.created_at) >= thirtyDaysAgo;
  }).length;

  recentNotices.textContent = recentCount;

  const categories = new Set(
    notices
      .map(function (notice) {
        return String(notice.category || "")
          .trim()
          .toLowerCase();
      })
      .filter(Boolean),
  );

  noticeCategories.textContent = categories.size;

  if (notices.length > 0) {
    latestNoticeDate.textContent = formatDate(notices[0].created_at);
  } else {
    latestNoticeDate.textContent = "N/A";
  }
}

// ==========================================
// Populate Category Filter
// ==========================================

function populateCategoryFilter() {
  if (!categoryFilter) {
    return;
  }

  const currentValue = categoryFilter.value;

  const categories = [];

  notices.forEach(function (notice) {
    const category = String(notice.category || "").trim();

    if (category && !categories.includes(category)) {
      categories.push(category);
    }
  });

  categories.sort(function (a, b) {
    return a.localeCompare(b);
  });

  categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;

  categories.forEach(function (category) {
    const option = document.createElement("option");

    option.value = category.toLowerCase();

    option.textContent = category;

    categoryFilter.appendChild(option);
  });

  const matchingOption = Array.from(categoryFilter.options).find(
    function (option) {
      return option.value === currentValue;
    },
  );

  if (matchingOption) {
    categoryFilter.value = currentValue;
  }
}

// ==========================================
// Display Notices
// ==========================================

function displayNotices() {
  const searchText = noticeSearch.value.trim().toLowerCase();

  const selectedCategory = categoryFilter.value.toLowerCase();

  const filteredNotices = notices.filter(function (notice) {
    const title = String(notice.title || "").toLowerCase();

    const category = String(notice.category || "").toLowerCase();

    const description = String(notice.description || "").toLowerCase();

    const matchesSearch =
      title.includes(searchText) ||
      category.includes(searchText) ||
      description.includes(searchText);

    const matchesCategory =
      selectedCategory === "all" || category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  noticeList.innerHTML = "";

  if (filteredNotices.length === 0) {
    noticeList.innerHTML = `
            <div class="empty-state">
                No notices found.
            </div>
        `;

    return;
  }

  filteredNotices.forEach(function (notice) {
    const card = document.createElement("article");

    card.className = "notice-card";

    const attachmentUrl = safeUrl(notice.attachment);

    const fullAttachmentUrl = attachmentUrl.startsWith("/")
      ? API_URL + attachmentUrl
      : attachmentUrl;

    const attachmentHTML = attachmentUrl
      ? `
                    <a
                        href="${escapeHTML(fullAttachmentUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="attachment-link"
                    >
                        📎 View Attachment
                    </a>
                `
      : `
                    <span class="no-attachment">
                        No attachment
                    </span>
                `;

    card.innerHTML = `
    <div class="notice-top">

        <div class="notice-heading">

            <div class="notice-title">
                ${escapeHTML(notice.title || "Untitled Notice")}
            </div>

            <div class="notice-id">
                Notice #${notice.id}
            </div>

        </div>


        <span class="notice-category">
            ${escapeHTML(notice.category || "General")}
        </span>

    </div>


    <div class="notice-description">

        ${escapeHTML(notice.description || "")}

    </div>


    <div class="notice-meta">

        <span>
            Published:
            <strong>
                ${formatDate(notice.created_at)}
            </strong>
        </span>


        <span class="notice-attachment">
            ${attachmentHTML}
        </span>

    </div>


    <div class="notice-actions">

        <button
            type="button"
            class="notice-action edit edit-notice-button"
            data-id="${notice.id}"
        >
            Edit
        </button>


        <button
            type="button"
            class="notice-action delete delete-notice-button"
            data-id="${notice.id}"
        >
            Delete
        </button>

    </div>
`;

    noticeList.appendChild(card);
  });
}

// ==========================================
// Validate Notice Form
// ==========================================

function validateNoticeForm() {
  const title = noticeTitle.value.trim();

  const category = noticeCategory.value.trim();

  const description = noticeDescription.value.trim();

  if (!title) {
    showFormError("Please enter a notice title.");

    noticeTitle.focus();

    return false;
  }

  if (title.length < 3) {
    showFormError("Notice title must contain at least 3 characters.");

    noticeTitle.focus();

    return false;
  }

  if (!category) {
    showFormError("Please enter a notice category.");

    noticeCategory.focus();

    return false;
  }

  if (!description) {
    showFormError("Please enter a notice description.");

    noticeDescription.focus();

    return false;
  }

  if (description.length < 10) {
    showFormError("Notice description must contain at least 10 characters.");

    noticeDescription.focus();

    return false;
  }

  // ==========================================
  // Attachment Validation
  // ==========================================

  if (noticeAttachment.files.length > 0) {
    const file = noticeAttachment.files[0];

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

    const fileName = file.name.toLowerCase();

    const extension = fileName.substring(fileName.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(extension)
    ) {
      showFormError("Only PDF, JPG, JPEG, PNG and WEBP files are allowed.");

      noticeAttachment.value = "";

      return false;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      showFormError("Attachment size must be 10 MB or less.");

      noticeAttachment.value = "";

      return false;
    }
  }

  return true;
}

// ==========================================
// Reset Form
// ==========================================

function resetForm() {
  noticeForm.reset();

  noticeId.value = "";

  isEditing = false;

  formTitle.textContent = "Publish New Notice";

  saveNoticeButton.textContent = "Publish Notice";

  cancelEditButton.hidden = true;

  showFormError("");

  showFormSuccess("");
}

// ==========================================
// Start Edit
// ==========================================

function startEditNotice(id) {
  const notice = notices.find(function (item) {
    return Number(item.id) === Number(id);
  });

  if (!notice) {
    return;
  }

  isEditing = true;

  noticeId.value = notice.id;

  noticeTitle.value = notice.title || "";

  noticeCategory.value = notice.category || "";

  noticeDescription.value = notice.description || "";

  // Clear file input.
  // A new file can optionally be selected.
  noticeAttachment.value = "";

  formTitle.textContent = "Edit Notice";

  saveNoticeButton.textContent = "Update Notice";

  cancelEditButton.hidden = false;

  showFormError("");

  showFormSuccess("");

  noticeForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==========================================
// Create Notice
// ==========================================

async function createNotice(formData) {
  const response = await fetch(`${API_URL}/api/admin/notices`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to publish notice.");
  }

  return data;
}

// ==========================================
// Update Notice
// ==========================================

async function updateNotice(id, formData) {
  const response = await fetch(`${API_URL}/api/admin/notices/${id}`, {
    method: "PUT",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update notice.");
  }

  return data;
}

// ==========================================
// Save Notice
// ==========================================

async function saveNotice(event) {
  event.preventDefault();

  showFormError("");

  showFormSuccess("");

  if (!validateNoticeForm()) {
    return;
  }

  const title = noticeTitle.value.trim();

  const category = noticeCategory.value.trim();

  const description = noticeDescription.value.trim();

  // ==========================================
  // FormData
  // ==========================================

  const formData = new FormData();

  formData.append("title", title);

  formData.append("category", category);

  formData.append("description", description);

  formData.append("published_by", admin.id);

  // ==========================================
  // Add Attachment
  // ==========================================

  if (noticeAttachment.files.length > 0) {
    formData.append("attachment", noticeAttachment.files[0]);
  }

  const editingId = noticeId.value.trim();

  const wasEditing = isEditing && Boolean(editingId);

  try {
    saveNoticeButton.disabled = true;

    saveNoticeButton.textContent = wasEditing ? "Updating..." : "Publishing...";

    if (wasEditing) {
      await updateNotice(editingId, formData);

      showFormSuccess("Notice updated successfully.");
    } else {
      await createNotice(formData);

      showFormSuccess("Notice published successfully.");
    }

    // Reset after successful operation
    resetForm();

    // Reload latest notices
    await loadNotices();

    showListSuccess(
      wasEditing
        ? "Notice updated successfully."
        : "Notice published successfully.",
    );
  } catch (error) {
    console.error("Error saving notice:", error);

    showFormError(
      error.message || "Something went wrong while saving the notice.",
    );
  } finally {
    saveNoticeButton.disabled = false;

    saveNoticeButton.textContent = isEditing
      ? "Update Notice"
      : "Publish Notice";
  }
}

// ==========================================
// Delete Notice
// ==========================================

async function deleteNotice(id) {
  const notice = notices.find(function (item) {
    return Number(item.id) === Number(id);
  });

  if (!notice) {
    return;
  }

  const confirmed = window.confirm(`Delete "${notice.title}"?`);

  if (!confirmed) {
    return;
  }

  try {
    showListError("");

    showListSuccess("");

    const response = await fetch(`${API_URL}/api/admin/notices/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete notice.");
    }

    showListSuccess("Notice deleted successfully.");

    await loadNotices();
  } catch (error) {
    console.error("Error deleting notice:", error);

    showListError(
      error.message || "Something went wrong while deleting the notice.",
    );
  }
}

// ==========================================
// Form Submit
// ==========================================

noticeForm.addEventListener("submit", saveNotice);

// ==========================================
// Cancel Edit
// ==========================================

cancelEditButton.addEventListener("click", function () {
  resetForm();
});

// ==========================================
// Search
// ==========================================

noticeSearch.addEventListener("input", displayNotices);

// ==========================================
// Category Filter
// ==========================================

categoryFilter.addEventListener("change", displayNotices);

// ==========================================
// Notice List Click Handling
// ==========================================

noticeList.addEventListener("click", function (event) {
  const editButton = event.target.closest(".edit-notice-button");

  if (editButton) {
    startEditNotice(Number(editButton.dataset.id));

    return;
  }

  const deleteButton = event.target.closest(".delete-notice-button");

  if (deleteButton) {
    deleteNotice(Number(deleteButton.dataset.id));
  }
});

// ==========================================
// Logout
// ==========================================

logoutLink.addEventListener("click", function (event) {
  event.preventDefault();

  localStorage.removeItem("towncareAdmin");

  localStorage.removeItem("towncareUser");

  window.location.href = "login.html";
});

// ==========================================
// Initial Load
// ==========================================

resetForm();

loadNotices();
