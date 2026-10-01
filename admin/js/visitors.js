// ==========================================
// TownCare - Admin Visitor Management
// ==========================================

const API_URL = "http://localhost:3000";


// ==========================================
// Get HTML Elements
// ==========================================

const adminInitials =
    document.getElementById("adminInitials");

const totalVisitors =
    document.getElementById("totalVisitors");

const pendingVisitors =
    document.getElementById("pendingVisitors");

const insideVisitors =
    document.getElementById("insideVisitors");

const completedVisitors =
    document.getElementById("completedVisitors");

const visitorSearch =
    document.getElementById("visitorSearch");

const statusFilter =
    document.getElementById("statusFilter");

const visitorList =
    document.getElementById("visitorList");

const listErrorMessage =
    document.getElementById("listErrorMessage");

const listSuccessMessage =
    document.getElementById("listSuccessMessage");

const logoutLink =
    document.getElementById("logoutLink");


// ==========================================
// Visitor Data
// ==========================================

let visitors = [];


// ==========================================
// Authentication Check
// ==========================================

const storedAdmin =
    localStorage.getItem("towncareAdmin");

if (!storedAdmin) {

    window.location.href = "login.html";

} else {

    try {

        const admin =
            JSON.parse(storedAdmin);

        if (
            !admin ||
            admin.role !== "admin"
        ) {

            localStorage.removeItem(
                "towncareAdmin"
            );

            window.location.href =
                "login.html";

        } else {

            displayAdminInitials(admin);

            loadVisitors();

        }

    } catch (error) {

        console.error(
            "Admin session error:",
            error
        );

        localStorage.removeItem(
            "towncareAdmin"
        );

        window.location.href =
            "login.html";
    }
}


// ==========================================
// Display Admin Initials
// ==========================================

function displayAdminInitials(admin) {

    if (!adminInitials) {
        return;
    }

    const name =
        admin.username ||
        admin.name ||
        "Administrator";

    adminInitials.textContent =
        getInitials(name);
}


// ==========================================
// Generate Initials
// ==========================================

function getInitials(name) {

    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (words.length === 0) {
        return "AD";
    }

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


// ==========================================
// Format Date
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "N/A";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================
// Format Time
// ==========================================

function formatTime(timeString) {

    if (!timeString) {
        return "N/A";
    }

    const parts =
        String(timeString).split(":");

    if (parts.length < 2) {
        return timeString;
    }

    let hours =
        parseInt(parts[0], 10);

    const minutes =
        parts[1];

    if (Number.isNaN(hours)) {
        return timeString;
    }

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    hours =
        hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
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
// Clear Messages
// ==========================================

function clearMessages() {

    listErrorMessage.textContent = "";
    listErrorMessage.style.display = "none";

    listSuccessMessage.textContent = "";
    listSuccessMessage.style.display = "none";
}


// ==========================================
// Show Error
// ==========================================

function showError(message) {

    listErrorMessage.textContent =
        message || "Something went wrong.";

    listErrorMessage.style.display =
        "block";
}


// ==========================================
// Show Success
// ==========================================

function showSuccess(message) {

    listSuccessMessage.textContent =
        message || "Operation successful.";

    listSuccessMessage.style.display =
        "block";

    setTimeout(function () {

        listSuccessMessage.style.display =
            "none";

        listSuccessMessage.textContent =
            "";

    }, 3000);
}


// ==========================================
// Show Loading State
// ==========================================

function showLoadingState() {

    visitorList.innerHTML = `
        <div class="loading-state">
            Loading visitors...
        </div>
    `;
}


// ==========================================
// Load Visitors
// ==========================================

async function loadVisitors() {

    showLoadingState();
    clearMessages();

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/visitors`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to retrieve visitors."
            );
        }

        visitors =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data.visitors
                    )
                        ? data.visitors
                        : []
                );

        updateStatistics();

        applyFilters();

    } catch (error) {

        console.error(
            "Visitors API error:",
            error
        );

        visitorList.innerHTML = `
            <div class="empty-state">
                Unable to load visitor records.
            </div>
        `;

        showError(
            error.message ||
            "Unable to load visitors. Make sure the TownCare backend is running."
        );
    }
}


// ==========================================
// Update Statistics
// ==========================================

function updateStatistics() {

    const total =
        visitors.length;

    const pending =
        visitors.filter(
            function (visitor) {
                return visitor.status === "upcoming";
            }
        ).length;

    const inside =
        visitors.filter(
            function (visitor) {
                return visitor.status === "inside";
            }
        ).length;

    const completed =
        visitors.filter(
            function (visitor) {
                return visitor.status === "completed";
            }
        ).length;

    totalVisitors.textContent =
        total;

    pendingVisitors.textContent =
        pending;

    insideVisitors.textContent =
        inside;

    completedVisitors.textContent =
        completed;
}


// ==========================================
// Apply Search + Status Filter
// ==========================================

function applyFilters() {

    const searchTerm =
        visitorSearch.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const filteredVisitors =
        visitors.filter(
            function (visitor) {

                const visitorName =
                    String(
                        visitor.visitor_name || ""
                    ).toLowerCase();

                const residentName =
                    String(
                        visitor.username || ""
                    ).toLowerCase();

                const houseNo =
                    String(
                        visitor.house_no || ""
                    ).toLowerCase();

                const mobile =
                    String(
                        visitor.mobile || ""
                    ).toLowerCase();

                const matchesSearch =
                    !searchTerm ||
                    visitorName.includes(searchTerm) ||
                    residentName.includes(searchTerm) ||
                    houseNo.includes(searchTerm) ||
                    mobile.includes(searchTerm);

                const matchesStatus =
                    selectedStatus === "all" ||
                    visitor.status ===
                        selectedStatus;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );

    displayVisitors(filteredVisitors);
}


// ==========================================
// Display Visitors
// ==========================================

function displayVisitors(visitorData) {

    visitorList.innerHTML = "";

    if (visitorData.length === 0) {

        visitorList.innerHTML = `
            <div class="empty-state">
                No visitor records found.
            </div>
        `;

        return;
    }

    visitorData.forEach(
        function (visitor) {

            const card =
                document.createElement("div");

            card.className =
                "visitor-card";

            let statusText =
                "Upcoming";

            let statusClass =
                "upcoming";

            if (
                visitor.status ===
                "inside"
            ) {

                statusText =
                    "Inside";

                statusClass =
                    "inside";

            } else if (
                visitor.status ===
                "completed"
            ) {

                statusText =
                    "Completed";

                statusClass =
                    "completed";
            }


            let actionHTML = "";

            if (
                visitor.status ===
                "upcoming"
            ) {

                actionHTML = `
                    <button
                        type="button"
                        class="accept-button"
                        data-id="${visitor.id}"
                    >
                        Accept Visitor
                    </button>
                `;

            } else if (
                visitor.status ===
                "inside"
            ) {

                actionHTML = `
                    <button
                        type="button"
                        class="complete-button"
                        data-id="${visitor.id}"
                    >
                        Mark Completed
                    </button>
                `;
            }


            card.innerHTML = `
                <div class="visitor-top">

                    <div class="visitor-heading">

                        <div class="visitor-name">
                            ${escapeHTML(
                                visitor.visitor_name ||
                                "Unknown Visitor"
                            )}
                        </div>

                        <div class="visitor-id">
                            Visitor #${visitor.id}
                        </div>

                    </div>

                    <span
                        class="visitor-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>


                <div class="visitor-details">

                    <div class="detail-item">

                        <span class="detail-label">
                            Resident
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                visitor.username ||
                                "N/A"
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            House No.
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                visitor.house_no ||
                                "N/A"
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Mobile
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                visitor.mobile ||
                                "N/A"
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Vehicle
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                visitor.vehicle ||
                                "Not provided"
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Visit Date
                        </span>

                        <span class="detail-value">
                            ${formatDate(
                                visitor.visit_date
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Expected Time
                        </span>

                        <span class="detail-value">
                            ${formatTime(
                                visitor.expected_time
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Purpose
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                visitor.purpose ||
                                "N/A"
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            Valid Till
                        </span>

                        <span class="detail-value">
                            ${formatTime(
                                visitor.valid_till
                            )}
                        </span>

                    </div>


                    <div class="detail-item">

                        <span class="detail-label">
                            OTP
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                visitor.otp ||
                                "N/A"
                            )}
                        </span>

                    </div>

                </div>


                <div class="visitor-actions">
                    ${actionHTML}
                </div>
            `;


            visitorList.appendChild(card);
        }
    );
}


// ==========================================
// Update Visitor Status
// ==========================================

async function updateVisitorStatus(
    visitorId,
    newStatus
) {

    clearMessages();

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/visitors/${visitorId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update visitor status."
            );
        }

        showSuccess(
            data.message ||
            "Visitor status updated successfully."
        );

        await loadVisitors();

    } catch (error) {

        console.error(
            "Visitor status update error:",
            error
        );

        showError(
            error.message ||
            "Unable to update visitor status."
        );
    }
}


// ==========================================
// Visitor Button Events
// ==========================================

visitorList.addEventListener(
    "click",
    function (event) {

        const acceptButton =
            event.target.closest(
                ".accept-button"
            );

        const completeButton =
            event.target.closest(
                ".complete-button"
            );


        if (acceptButton) {

            const visitorId =
                acceptButton.dataset.id;

            const confirmed =
                window.confirm(
                    "Confirm that this visitor has arrived?"
                );

            if (!confirmed) {
                return;
            }

            updateVisitorStatus(
                visitorId,
                "inside"
            );

            return;
        }


        if (completeButton) {

            const visitorId =
                completeButton.dataset.id;

            const confirmed =
                window.confirm(
                    "Mark this visitor as completed?"
                );

            if (!confirmed) {
                return;
            }

            updateVisitorStatus(
                visitorId,
                "completed"
            );
        }
    }
);


// ==========================================
// Search Event
// ==========================================

visitorSearch.addEventListener(
    "input",
    function () {

        applyFilters();

    }
);


// ==========================================
// Status Filter Event
// ==========================================

statusFilter.addEventListener(
    "change",
    function () {

        applyFilters();

    }
);


// ==========================================
// Logout
// ==========================================

logoutLink.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        localStorage.removeItem(
            "towncareAdmin"
        );

        window.location.href =
            "login.html";
    }
);