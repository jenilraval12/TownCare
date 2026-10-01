// ==========================================
// TownCare - Home
// ==========================================

// ==========================================
// Check Login Status
// ==========================================

const loggedInUser = localStorage.getItem("towncareUser");

if (!loggedInUser) {
  window.location.href = "login.html";
}

const user = JSON.parse(loggedInUser);

const API_URL = "http://localhost:3000";

// ==========================================
// Display Logged-in User Information
// ==========================================

const welcomeName = document.getElementById("welcomeName");

const welcomeHouse = document.getElementById("welcomeHouse");

const profileInitials = document.getElementById("profileInitials");

// ------------------------------------------
// Welcome Name
// ------------------------------------------

if (welcomeName) {
  const firstName = user.username.trim().split(" ")[0];

  welcomeName.textContent = firstName;
}

// ------------------------------------------
// House Number
// ------------------------------------------

if (welcomeHouse) {
  welcomeHouse.textContent = user.house_no;
}

// ------------------------------------------
// Profile Initials
// ------------------------------------------

if (profileInitials) {
  const initials = user.username
    .trim()
    .split(" ")
    .map(function (name) {
      return name.charAt(0);
    })
    .join("")
    .substring(0, 2)
    .toUpperCase();

  profileInitials.textContent = initials;
}

// ==========================================
// Helper Functions
// ==========================================

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const parts = dateString.toString().split("T")[0].split("-");

  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return dateString;
}

function formatShortDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const parts = dateString.toString().split("T")[0].split("-");

  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }

  return dateString;
}

function formatTime(timeString) {
  if (!timeString) {
    return "-";
  }

  const timePart = timeString.toString().split("T").pop().split(".")[0];

  const parts = timePart.split(":");

  if (parts.length >= 2) {
    const hours = Number(parts[0]);
    const minutes = parts[1];

    const period = hours >= 12 ? "PM" : "AM";

    const displayHour = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  return timeString;
}

function formatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

function escapeHTML(value) {
  const text = String(value ?? "");

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getComplaintStatusClass(status) {
  if (status === "Pending") {
    return "pending";
  }

  if (status === "Assigned") {
    return "progress";
  }

  if (status === "In Progress") {
    return "progress";
  }

  if (status === "Resolved") {
    return "resolved";
  }

  return "pending";
}

// ==========================================
// Get Dashboard Panels
// ==========================================

const dashboardPanels = document.querySelectorAll(".dashboard-grid .panel");

const complaintsPanel = dashboardPanels[0];

const billPanel = dashboardPanels[1];

const noticesPanel = dashboardPanels[2];

const visitorPanel = dashboardPanels[3];

// ==========================================
// Load Dashboard Data
// ==========================================

async function loadDashboard() {
  try {
    const [
      complaintsResponse,
      billsResponse,
      visitorsResponse,
      noticesResponse,
    ] = await Promise.all([
      fetch(`${API_URL}/api/complaints/${user.id}`),

      fetch(`${API_URL}/api/bills/${user.id}`),

      fetch(`${API_URL}/api/visitors/${user.id}`),

      fetch(`${API_URL}/api/notices`),
    ]);

    const complaintsData = await complaintsResponse.json();

    const billsData = await billsResponse.json();

    const visitorsData = await visitorsResponse.json();

    const noticesData = await noticesResponse.json();

    // --------------------------------------
    // Check Complaints Response
    // --------------------------------------

    if (!complaintsResponse.ok) {
      console.error("Unable to load complaints:", complaintsData.message);
    }

    // --------------------------------------
    // Check Bills Response
    // --------------------------------------

    if (!billsResponse.ok) {
      console.error("Unable to load bills:", billsData.message);
    }

    // --------------------------------------
    // Check Visitors Response
    // --------------------------------------

    if (!visitorsResponse.ok) {
      console.error("Unable to load visitors:", visitorsData.message);
    }

    if (!noticesResponse.ok) {
      console.error("Unable to load notices:", noticesData.message);
    }

    // --------------------------------------
    // Extract Actual Arrays
    // --------------------------------------

    const complaints = complaintsResponse.ok
      ? Array.isArray(complaintsData)
        ? complaintsData
        : complaintsData.complaints || []
      : [];

    const bills = billsResponse.ok
      ? Array.isArray(billsData)
        ? billsData
        : billsData.bills || []
      : [];

    const visitors = visitorsResponse.ok
      ? Array.isArray(visitorsData)
        ? visitorsData
        : visitorsData.visitors || []
      : [];

    const notices = noticesResponse.ok
      ? Array.isArray(noticesData)
        ? noticesData
        : noticesData.notices || []
      : [];
    // --------------------------------------
    // Display Dashboard Data
    // --------------------------------------

    displayRecentComplaints(complaints);

    displayCurrentBill(bills);

    displayPaymentPreview(bills);

    displayRecentVisitors(visitors);

    displayLatestNotices(notices);
  } catch (error) {
    console.error("Home Dashboard Error:", error);
  }
}

// ==========================================
// Recent Complaints
// ==========================================

function displayRecentComplaints(complaints) {
  if (!complaintsPanel) {
    return;
  }

  if (complaints.length === 0) {
    complaintsPanel.innerHTML = `
            <div class="panel-header">

                <h2>
                    Recent Complaints
                </h2>

                <a
                    href="complaints.html"
                    class="view-all"
                >
                    View All
                </a>

            </div>

            <div class="activity-item">

                <div class="activity-main">

                    <div>

                        <div class="activity-name">
                            No Complaints Yet
                        </div>

                        <div class="activity-sub">
                            Your submitted complaints will appear here.
                        </div>

                    </div>

                </div>

            </div>
        `;

    return;
  }

  const recentComplaints = complaints.slice(0, 3);

  complaintsPanel.innerHTML = `
        <div class="panel-header">

            <h2>
                Recent Complaints
            </h2>

            <a
                href="complaints.html"
                class="view-all"
            >
                View All
            </a>

        </div>
    `;

  recentComplaints.forEach(function (complaint) {
    const statusClass = getComplaintStatusClass(complaint.status);

    const activityItem = document.createElement("div");

    activityItem.className = "activity-item";

    activityItem.innerHTML = `

                <div class="activity-main">

                    <div>

                        <div class="activity-name">
                            ${complaint.category}
                        </div>

                        <div class="activity-sub">
                            ${complaint.location}
                        </div>

                    </div>

                    <span class="status ${statusClass}">
                        ${complaint.status}
                    </span>

                </div>

            `;

    complaintsPanel.appendChild(activityItem);
  });
}

// ==========================================
// Current Bill
// ==========================================

function displayCurrentBill(bills) {
  if (!billPanel) {
    return;
  }

  const currentBill = bills.length > 0 ? bills[0] : null;

  if (!currentBill) {
    billPanel.innerHTML = `

            <div class="panel-header">

                <h2>
                    My Current Bill
                </h2>

                <a
                    href="bills.html"
                    class="view-all"
                >
                    View Bills
                </a>

            </div>


            <div class="bill-card">

                <div>

                    <div class="bill-label">
                        Current Bill
                    </div>

                    <div class="bill-value">
                        No Bill
                    </div>

                </div>

                <div class="bill-due">
                    -
                </div>

            </div>

        `;

    return;
  }

  const billType = currentBill.bill_type || "Maintenance Bill";

  billPanel.innerHTML = `

        <div class="panel-header">

            <h2>
                My Current Bill
            </h2>

            <a
                href="bills.html"
                class="view-all"
            >
                View Bills
            </a>

        </div>


        <div class="bill-card">

            <div>

                <div class="bill-label">
                    ${billType} - ${currentBill.month} ${currentBill.year}
                </div>

                <div class="bill-value">
                    ₹${formatAmount(currentBill.amount)}
                </div>

            </div>

            <div class="bill-due">
                Due: ${formatShortDate(currentBill.due_date)}
            </div>

        </div>

    `;
}

// ==========================================
// Payment History Preview
// ==========================================

function displayPaymentPreview(bills) {
  if (!billPanel) {
    return;
  }

  const paidBill = bills.find(function (bill) {
    return bill.status === "Paid";
  });

  if (!paidBill) {
    return;
  }

  const activityItem = document.createElement("div");

  activityItem.className = "activity-item";

  activityItem.innerHTML = `

        <div class="activity-main">

            <div>

                <div class="activity-name">
                    ${paidBill.month} ${paidBill.year}
                </div>

                <div class="activity-sub">
                    ₹${formatAmount(paidBill.amount)}
                </div>

            </div>

            <span class="status resolved">
                Paid
            </span>

        </div>

    `;

  billPanel.appendChild(activityItem);
}

// ==========================================
// Recent Visitors
// ==========================================

function displayRecentVisitors(visitors) {
  if (!visitorPanel) {
    return;
  }

  if (visitors.length === 0) {
    visitorPanel.innerHTML = `

            <div class="panel-header">

                <h2>
                    Recent Visitor
                </h2>

                <a
                    href="visitors.html"
                    class="view-all"
                >
                    Visitors
                </a>

            </div>


            <div class="visitor-card">

                <div class="visitor-top">

                    <div class="visitor-name">
                        No Visitor Records
                    </div>

                </div>

                <div class="visitor-info">
                    Your visitor invitations will appear here.
                </div>

            </div>

        `;

    return;
  }

  const recentVisitors = visitors.slice(0, 2);

  visitorPanel.innerHTML = `

        <div class="panel-header">

            <h2>
                Recent Visitor
            </h2>

            <a
                href="visitors.html"
                class="view-all"
            >
                Visitors
            </a>

        </div>

    `;

  recentVisitors.forEach(function (visitor) {
    const statusClass =
      visitor.status === "completed"
        ? "resolved"
        : visitor.status === "inside"
          ? "resolved"
          : "progress";

    const statusText =
      visitor.status === "completed"
        ? "Completed"
        : visitor.status === "inside"
          ? "Inside"
          : "Upcoming";

    const visitorCard = document.createElement("div");

    visitorCard.className = "visitor-card";

    visitorCard.innerHTML = `

                <div class="visitor-top">

                    <div class="visitor-name">
                        ${visitor.visitor_name}
                    </div>

                    <span class="status ${statusClass}">
                        ${statusText}
                    </span>

                </div>


                <div class="visitor-info">

                    Visiting Date:
                    ${formatDate(visitor.visit_date)}

                    <br />

                    Expected Time:
                    ${formatTime(visitor.expected_time)}

                    <br />

                    Vehicle:
                    ${visitor.vehicle || "Not provided"}

                </div>

            `;

    visitorPanel.appendChild(visitorCard);
  });
}

function displayLatestNotices(notices) {
  if (!noticesPanel) {
    return;
  }

  if (notices.length === 0) {
    noticesPanel.innerHTML = `

            <div class="panel-header">

                <h2>
                    Latest Notices
                </h2>

                <a
                    href="notices.html"
                    class="view-all"
                >
                    View All
                </a>

            </div>

            <div class="notice-item">

                <h3>
                    No Notices Yet
                </h3>

                <p>
                    Township announcements will appear here.
                </p>

            </div>

        `;

    return;
  }

  const latestNotices = notices.slice(0, 2);

  noticesPanel.innerHTML = `

        <div class="panel-header">

            <h2>
                Latest Notices
            </h2>

            <a
                href="notices.html"
                class="view-all"
            >
                View All
            </a>

        </div>

    `;

  latestNotices.forEach(function (notice) {
    const noticeItem = document.createElement("div");

    noticeItem.className = "notice-item";

    noticeItem.innerHTML = `

                <div class="notice-category">
                    ${escapeHTML(notice.category || "General")}
                </div>

                <h3>
                    ${escapeHTML(notice.title || "Township Notice")}
                </h3>

                <p>
                    ${escapeHTML(
                      notice.description || "No description available.",
                    )}
                </p>

            `;

    noticesPanel.appendChild(noticeItem);
  });
}

// ==========================================
// Township Slideshow
// ==========================================

const slides = document.querySelectorAll(".slide");

const dots = document.querySelectorAll(".dot");

let currentSlide = 0;

// ==========================================
// Show Slide
// ==========================================

function showSlide(index) {
  slides.forEach(function (slide) {
    slide.classList.remove("active");
  });

  dots.forEach(function (dot) {
    dot.classList.remove("active");
  });

  if (slides[index]) {
    slides[index].classList.add("active");
  }

  if (dots[index]) {
    dots[index].classList.add("active");
  }
}

// ==========================================
// Next Slide
// ==========================================

function nextSlide() {
  currentSlide++;

  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  showSlide(currentSlide);
}

// ==========================================
// Start Slideshow
// ==========================================

if (slides.length > 0) {
  setInterval(nextSlide, 4000);
}

// ==========================================
// Load Home Dashboard
// ==========================================

loadDashboard();
