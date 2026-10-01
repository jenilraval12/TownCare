// ==========================================
// TownCare - Admin Dashboard
// ==========================================

const API_URL = "http://localhost:3000";

// ==========================================
// Elements
// ==========================================

const adminName = document.getElementById("adminName");

const adminInitials = document.getElementById("adminInitials");

const totalResidents = document.getElementById("totalResidents");

const pendingRegistrations = document.getElementById("pendingRegistrations");

const activeComplaints = document.getElementById("activeComplaints");

const pendingBills = document.getElementById("pendingBills");

const recentComplaints = document.getElementById("recentComplaints");

const pendingResidents = document.getElementById("pendingResidents");

const recentBills = document.getElementById("recentBills");

const latestNotices = document.getElementById("latestNotices");

const recentVisitors = document.getElementById("recentVisitors");

const logoutLink = document.getElementById("logoutLink");

// ==========================================
// Admin Authentication
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
      displayAdminDetails(admin);

      loadDashboard();
    }
  } catch (error) {
    console.error("Invalid admin session:", error);

    localStorage.removeItem("towncareAdmin");

    window.location.href = "login.html";
  }
}

// ==========================================
// Display Admin Information
// ==========================================

function displayAdminDetails(admin) {
  const name = admin.username || "Administrator";

  adminName.textContent = name;

  const initials = getInitials(name);

  adminInitials.textContent = initials;
}

// ==========================================
// Generate Initials
// ==========================================

function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "AD";
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// ==========================================
// Dashboard API
// ==========================================

async function loadDashboard() {
  showLoadingStates();

  try {
    const [response, visitorsResponse] = await Promise.all([
      fetch(`${API_URL}/api/admin/dashboard`),
      fetch(`${API_URL}/api/admin/visitors`),
    ]);

    if (!response.ok) {
      throw new Error("Unable to load dashboard data.");
    }

    const data = await response.json();

    let visitorsData = {
      visitors: [],
    };

    if (visitorsResponse.ok) {
      visitorsData = await visitorsResponse.json();
    }

    const visitors = Array.isArray(visitorsData.visitors)
      ? visitorsData.visitors
      : [];

    const stats = data.stats || {};

    const complaints = Array.isArray(data.recentComplaints)
      ? data.recentComplaints
      : [];

    const residents = Array.isArray(data.pendingResidents)
      ? data.pendingResidents
      : [];

    const bills = Array.isArray(data.recentBills) ? data.recentBills : [];

    const notices = Array.isArray(data.latestNotices) ? data.latestNotices : [];

    // ======================================
    // Statistics
    // ======================================

    totalResidents.textContent = formatNumber(stats.totalResidents);

    pendingRegistrations.textContent = formatNumber(stats.pendingRegistrations);

    activeComplaints.textContent = formatNumber(stats.activeComplaints);

    pendingBills.textContent = formatNumber(stats.pendingBills);

    // ======================================
    // Dashboard Sections
    // ======================================

    renderComplaints(complaints);

    renderVisitors(visitors);

    renderPendingResidents(residents);

    renderBills(bills);

    renderNotices(notices);
  } catch (error) {
    console.error("Dashboard Error:", error);

    showDashboardError(
      "Unable to load dashboard data. Make sure the TownCare backend is running.",
    );
  }
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
// Loading State
// ==========================================

function showLoadingStates() {
  totalResidents.textContent = "...";

  pendingRegistrations.textContent = "...";

  activeComplaints.textContent = "...";

  pendingBills.textContent = "...";

  recentComplaints.innerHTML = `<div class="loading-state">
            Loading complaints...
        </div>`;

  pendingResidents.innerHTML = `<div class="loading-state">
            Loading registrations...
        </div>`;

  recentBills.innerHTML = `<div class="loading-state">
            Loading bills...
        </div>`;

  latestNotices.innerHTML = `<div class="loading-state">
            Loading notices...
        </div>`;

  recentVisitors.innerHTML = `<div class="loading-state">Loading visitors...</div>`;
}

// ==========================================
// Complaints
// ==========================================

function renderComplaints(complaints) {
  if (complaints.length === 0) {
    recentComplaints.innerHTML = `<div class="empty-state">
                No complaints found.
            </div>`;

    return;
  }

  recentComplaints.innerHTML = complaints
    .map((complaint) => {
      const statusClass = getStatusClass(complaint.status);

      return `
                        <div class="activity-item">

                            <div class="activity-main">

                                <div>

                                    <div class="activity-name">
                                        ${escapeHTML(
                                          complaint.category || "Complaint",
                                        )}
                                    </div>

                                    <div class="activity-sub">
                                        ${escapeHTML(
                                          complaint.description ||
                                            complaint.location ||
                                            "No description available.",
                                        )}
                                    </div>

                                    <div class="activity-date">
                                        House No.:
                                        ${escapeHTML(
                                          complaint.house_no || "N/A",
                                        )}

                                        &nbsp; | &nbsp;

                                        ${formatDate(complaint.created_at)}
                                    </div>

                                </div>

                                <span class="status ${statusClass}">
                                    ${escapeHTML(complaint.status || "Pending")}
                                </span>

                            </div>

                        </div>
                    `;
    })
    .join("");
}

// ==========================================
// Pending Residents
// ==========================================

function renderPendingResidents(residents) {
  if (residents.length === 0) {
    pendingResidents.innerHTML = `<div class="empty-state">
                No pending registrations.
            </div>`;

    return;
  }

  pendingResidents.innerHTML = residents
    .map((resident) => {
      return `
                        <div class="resident-item">

                            <div class="resident-main">

                                <div>

                                    <div class="resident-name">
                                        ${escapeHTML(
                                          resident.username || "Resident",
                                        )}
                                    </div>

                                    <div class="resident-info">
                                        Mobile:
                                        ${escapeHTML(
                                          resident.phone_no || "N/A",
                                        )}
                                    </div>

                                    <div class="resident-house">
                                        House No.:
                                        ${escapeHTML(
                                          resident.house_no || "N/A",
                                        )}
                                    </div>

                                </div>

                                <span class="status pending">
                                    Pending
                                </span>

                            </div>

                        </div>
                    `;
    })
    .join("");
}

function renderVisitors(visitors) {
  if (!visitors || visitors.length === 0) {
    recentVisitors.innerHTML = `
            <div class="empty-state">
                No visitor records found.
            </div>
        `;
    return;
  }

  recentVisitors.innerHTML = visitors
    .slice(0, 3)
    .map((visitor) => {
      let statusClass = "pending";
      let statusText = "Upcoming";

      if (visitor.status === "inside") {
        statusClass = "resolved";
        statusText = "Inside";
      } else if (visitor.status === "completed") {
        statusClass = "resolved";
        statusText = "Completed";
      } else if (visitor.status === "upcoming") {
        statusClass = "progress";
        statusText = "Upcoming";
      }

      return `
                <div class="activity-item">

                    <div class="activity-main">

                        <div>

                            <div class="activity-name">
                                ${escapeHTML(visitor.visitor_name || "Unknown Visitor")}
                            </div>

                            <div class="activity-sub">
                                Resident:
                                ${escapeHTML(visitor.username || "Unknown")}
                                &nbsp; | &nbsp;
                                House:
                                ${escapeHTML(visitor.house_no || "N/A")}
                            </div>

                            <div class="activity-date">
                                Visit:
                                ${formatDate(visitor.visit_date)}
                                &nbsp; | &nbsp;
                                ${formatTime(visitor.expected_time)}
                            </div>

                        </div>

                        <span class="status ${statusClass}">
                            ${statusText}
                        </span>

                    </div>

                </div>
            `;
    })
    .join("");
}

// ==========================================
// Bills
// ==========================================

function renderBills(bills) {
  if (bills.length === 0) {
    recentBills.innerHTML = `<div class="empty-state">
                No bills found.
            </div>`;

    return;
  }

  recentBills.innerHTML = bills
    .map((bill) => {
      const amount = Number(bill.amount);

      const formattedAmount = Number.isNaN(amount)
        ? "₹0.00"
        : `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;

      const statusClass = bill.status === "Paid" ? "resolved" : "pending";

      return `
                        <div class="bill-card">

                            <div>

                                <div class="bill-label">
                                    ${escapeHTML(
                                      bill.bill_type || "Maintenance Bill",
                                    )}
                                </div>

                                <div class="bill-value">
                                    ${formattedAmount}
                                </div>

                                <div class="bill-due">
                                    House No.:
                                    ${escapeHTML(bill.house_no || "N/A")}
                                </div>

                            </div>

                            <span class="status ${statusClass}">
                                ${escapeHTML(bill.status || "Pending")}
                            </span>

                        </div>
                    `;
    })
    .join("");
}

// ==========================================
// Notices
// ==========================================

function renderNotices(notices) {
  if (notices.length === 0) {
    latestNotices.innerHTML = `<div class="empty-state">
                No notices available.
            </div>`;

    return;
  }

  latestNotices.innerHTML = notices
    .map((notice) => {
      return `
                        <div class="notice-item">

                            <div class="notice-category">
                                ${escapeHTML(notice.category || "General")}
                            </div>

                            <h3>
                                ${escapeHTML(notice.title || "Township Notice")}
                            </h3>

                            <p>
                                ${escapeHTML(
                                  notice.description ||
                                    "No description available.",
                                )}
                            </p>

                            <div class="notice-date">
                                ${formatDate(notice.created_at)}
                            </div>

                        </div>
                    `;
    })
    .join("");
}

// ==========================================
// Status Class
// ==========================================

function getStatusClass(status) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "pending";

    case "assigned":
      return "assigned";

    case "in progress":
      return "progress";

    case "resolved":
      return "resolved";

    default:
      return "pending";
  }
}

// ==========================================
// Date Formatting
// ==========================================

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "N/A";
  }

  const time = String(timeValue).slice(0, 5);

  const [hours, minutes] = time.split(":");

  const date = new Date();
  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
// ==========================================
// HTML Safety
// ==========================================

function escapeHTML(value) {
  const text = String(value ?? "");

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// Dashboard Error
// ==========================================

function showDashboardError(message) {
  totalResidents.textContent = "—";

  pendingRegistrations.textContent = "—";

  activeComplaints.textContent = "—";

  pendingBills.textContent = "—";

  recentComplaints.innerHTML = `<div class="empty-state">
            ${escapeHTML(message)}
        </div>`;

  pendingResidents.innerHTML = `<div class="empty-state">
            ${escapeHTML(message)}
        </div>`;

  recentBills.innerHTML = `<div class="empty-state">
            ${escapeHTML(message)}
        </div>`;

  latestNotices.innerHTML = `<div class="empty-state">
            ${escapeHTML(message)}
        </div>`;

  recentVisitors.innerHTML = `<div class="empty-state">
            ${escapeHTML(message)}
        </div>`;
}

// ==========================================
// Logout
// ==========================================

logoutLink.addEventListener("click", function (event) {
  event.preventDefault();

  localStorage.removeItem("towncareAdmin");

  window.location.href = "login.html";
});
