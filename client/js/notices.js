// ==========================================
// TownCare - Client Notice Board
// ==========================================

const API_URL = "http://localhost:3000";

// ==========================================
// Check Login Status
// ==========================================

const loggedInUser = localStorage.getItem("towncareUser");

if (!loggedInUser) {
  window.location.href = "login.html";
  throw new Error("User is not logged in.");
}

const user = JSON.parse(loggedInUser);

// ==========================================
// Notice Data
// ==========================================

let notices = [];

// ==========================================
// Get HTML Elements
// ==========================================

const noticeList = document.getElementById("noticeList");

const noResult = document.getElementById("noResult");

const searchInput = document.getElementById("searchInput");

const fromDate = document.getElementById("fromDate");

const toDate = document.getElementById("toDate");

const categoryFilter = document.getElementById("categoryFilter");

const clearFilters = document.getElementById("clearFilters");

const noticeModal = document.getElementById("noticeModal");

const closeModal = document.getElementById("closeModal");

const modalCategory = document.getElementById("modalCategory");

const modalTitle = document.getElementById("modalTitle");

const modalDate = document.getElementById("modalDate");

const modalDescription = document.getElementById("modalDescription");

const modalAttachment = document.getElementById("modalAttachment");

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
// Get Attachment URL
// ==========================================

function getAttachmentURL(attachmentPath) {
  if (!attachmentPath) {
    return "";
  }

  const path = String(attachmentPath).trim();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_URL}${path}`;
  }

  return `${API_URL}/${path}`;
}

// ==========================================
// Load Notices From Backend
// ==========================================

async function loadNotices() {
  try {
    noticeList.innerHTML = `
            <div class="loading-message">
                Loading notices...
            </div>
        `;

    noResult.style.display = "none";

    const response = await fetch(`${API_URL}/api/notices`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load notices.");
    }

    // Backend returns:
    // { notices: [...] }

    if (Array.isArray(data)) {
      notices = data;
    } else if (Array.isArray(data.notices)) {
      notices = data.notices;
    } else {
      notices = [];
    }

    // Add UI-only read state

    notices = notices.map(function (notice) {
      return {
        ...notice,
        read: false,
      };
    });

    // Latest notice first

    notices.sort(function (a, b) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    populateCategories();

    displayNotices(notices);
  } catch (error) {
    console.error("Error loading notices:", error);

    noticeList.innerHTML = `
            <div class="error-message">
                Unable to load notices.
                Please try again.
            </div>
        `;

    noResult.style.display = "none";
  }
}

// ==========================================
// Populate Categories
// ==========================================

function populateCategories() {
  const selectedValue = categoryFilter.value;

  const categories = [];

  notices.forEach(function (notice) {
    const category = String(notice.category || "").trim();

    if (
      category &&
      !categories.some(function (item) {
        return item.toLowerCase() === category.toLowerCase();
      })
    ) {
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

  if (
    Array.from(categoryFilter.options).some(function (option) {
      return option.value === selectedValue;
    })
  ) {
    categoryFilter.value = selectedValue;
  } else {
    categoryFilter.value = "all";
  }
}

// ==========================================
// Display Notices
// ==========================================

function displayNotices(noticesToDisplay) {
  noticeList.innerHTML = "";

  if (noticesToDisplay.length === 0) {
    noResult.style.display = "block";

    return;
  }

  noResult.style.display = "none";

  noticesToDisplay.forEach(function (notice) {
    const noticeCard = document.createElement("article");

    noticeCard.className = "notice-card";

    const readClass = notice.read ? "read" : "";

    const category = notice.category || "General";

    const title = notice.title || "Untitled Notice";

    const description = notice.description || "";

    const date = notice.created_at;

    const preview =
      description.length > 150
        ? description.substring(0, 150) + "..."
        : description;

    // ----------------------------------
    // Attachment
    // ----------------------------------

    let attachmentHTML = "";

    if (notice.attachment) {
      const attachmentURL = getAttachmentURL(notice.attachment);

      const fileName = notice.attachment.split("/").pop();

      attachmentHTML = `
                    <div class="attachment">
                        📎
                        <a
                            href="${escapeHTML(attachmentURL)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${escapeHTML(fileName)}
                        </a>
                    </div>
                `;
    } else {
      attachmentHTML = `
                    <div class="attachment">
                        No attachment
                    </div>
                `;
    }

    noticeCard.innerHTML = `

                <div class="notice-top">

                    <span class="notice-category">
                        ${escapeHTML(category)}
                    </span>


                    <span class="notice-date">
                        Posted:
                        ${formatDate(date)}
                    </span>

                </div>


                <div
                    class="notice-subject ${readClass}"
                >
                    ${escapeHTML(title)}
                </div>


                <p class="notice-preview">

                    ${escapeHTML(preview)}

                </p>


                <div class="notice-bottom">

                    ${attachmentHTML}


                    <button
                        type="button"
                        class="view-button"
                        data-id="${notice.id}"
                    >
                        View More →
                    </button>

                </div>

            `;

    noticeList.appendChild(noticeCard);
  });
}

// ==========================================
// Filter Notices
// ==========================================

function filterNotices() {
  const searchText = searchInput.value.trim().toLowerCase();

  const selectedFromDate = fromDate.value;

  const selectedToDate = toDate.value;

  const selectedCategory = categoryFilter.value.toLowerCase();

  const filteredNotices = notices.filter(function (notice) {
    const title = String(notice.title || "").toLowerCase();

    const description = String(notice.description || "").toLowerCase();

    const category = String(notice.category || "").toLowerCase();

    const noticeDate = notice.created_at
      ? new Date(notice.created_at).toISOString().split("T")[0]
      : "";

    const searchMatch =
      title.includes(searchText) ||
      description.includes(searchText) ||
      category.includes(searchText);

    const categoryMatch =
      selectedCategory === "all" || category === selectedCategory;

    const fromDateMatch =
      selectedFromDate === "" || noticeDate >= selectedFromDate;

    const toDateMatch = selectedToDate === "" || noticeDate <= selectedToDate;

    return searchMatch && categoryMatch && fromDateMatch && toDateMatch;
  });

  displayNotices(filteredNotices);
}

// ==========================================
// Open Notice
// ==========================================

function openNotice(noticeId) {
  const notice = notices.find(function (item) {
    return Number(item.id) === Number(noticeId);
  });

  if (!notice) {
    return;
  }

  // Mark as read
  notice.read = true;

  modalCategory.textContent = notice.category || "General";

  modalTitle.textContent = notice.title || "Untitled Notice";

  modalDate.textContent = "Posted: " + formatDate(notice.created_at);

  modalDescription.textContent =
    notice.description || "No description available.";

  // ----------------------------------
  // Attachment in Modal
  // ----------------------------------

  if (notice.attachment) {
    const attachmentURL = getAttachmentURL(notice.attachment);

    const fileName = notice.attachment.split("/").pop();

    const extension = fileName.split(".").pop().toLowerCase();

    const imageExtensions = ["jpg", "jpeg", "png", "webp"];

    // ----------------------------------
    // Image Attachment
    // ----------------------------------

    if (imageExtensions.includes(extension)) {
      modalAttachment.innerHTML = `

            <div class="modal-attachment-title">
                📎 Attachment
            </div>


            <img
                src="${escapeHTML(attachmentURL)}"
                alt="${escapeHTML(fileName)}"
                class="modal-attachment-image"
            >


            <a
                href="${escapeHTML(attachmentURL)}"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-attachment-link"
            >
                ${escapeHTML(fileName)}
            </a>

        `;

      // ----------------------------------
      // PDF Attachment
      // ----------------------------------
    } else if (extension === "pdf") {
      modalAttachment.innerHTML = `

            <div class="modal-attachment-title">
                📎 Attachment
            </div>


            <iframe
                src="${escapeHTML(attachmentURL)}"
                class="modal-attachment-pdf"
                title="${escapeHTML(fileName)}"
            ></iframe>


            <a
                href="${escapeHTML(attachmentURL)}"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-attachment-link"
            >
                Open ${escapeHTML(fileName)}
            </a>

        `;

      // ----------------------------------
      // Other Attachment
      // ----------------------------------
    } else {
      modalAttachment.innerHTML = `

            <div class="modal-attachment-title">
                📎 Attachment
            </div>


            <a
                href="${escapeHTML(attachmentURL)}"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-attachment-link"
            >
                ${escapeHTML(fileName)}
            </a>

        `;
    }
  } else {
    modalAttachment.innerHTML = "No attachment available.";
  }

  noticeModal.style.display = "flex";
}

// ==========================================
// Close Notice Modal
// ==========================================

function closeNotice() {
  noticeModal.style.display = "none";
}

// ==========================================
// Search and Filters
// ==========================================

searchInput.addEventListener("input", filterNotices);

fromDate.addEventListener("change", filterNotices);

toDate.addEventListener("change", filterNotices);

categoryFilter.addEventListener("change", filterNotices);

// ==========================================
// Clear Filters
// ==========================================

clearFilters.addEventListener("click", function () {
  searchInput.value = "";

  fromDate.value = "";

  toDate.value = "";

  categoryFilter.value = "all";

  displayNotices(notices);
});

// ==========================================
// Notice Card Click Handling
// ==========================================

noticeList.addEventListener("click", function (event) {
  const button = event.target.closest(".view-button");

  if (!button) {
    return;
  }

  const noticeId = Number(button.dataset.id);

  openNotice(noticeId);
});

// ==========================================
// Close Modal
// ==========================================

closeModal.addEventListener("click", closeNotice);

// ==========================================
// Close Modal When Clicking Outside
// ==========================================

noticeModal.addEventListener("click", function (event) {
  if (event.target === noticeModal) {
    closeNotice();
  }
});

// ==========================================
// Load Notices When Page Loads
// ==========================================

loadNotices();
