// ==========================================
// TownCare - Admin Residents
// ==========================================

const API_URL = "http://localhost:3000";


// ==========================================
// Elements
// ==========================================

const adminInitials =
    document.getElementById("adminInitials");

const totalResidents =
    document.getElementById("totalResidents");

const pendingResidents =
    document.getElementById("pendingResidents");

const approvedResidents =
    document.getElementById("approvedResidents");

const rejectedResidents =
    document.getElementById("rejectedResidents");

const residentSearch =
    document.getElementById("residentSearch");

const statusFilter =
    document.getElementById("statusFilter");

const residentList =
    document.getElementById("residentList");

const errorMessage =
    document.getElementById("errorMessage");

const successMessage =
    document.getElementById("successMessage");

const logoutLink =
    document.getElementById("logoutLink");


// ==========================================
// Resident Data
// ==========================================

let residents = [];


// ==========================================
// Authentication Check
// ==========================================

const storedAdmin =
    localStorage.getItem("towncareAdmin");


if (!storedAdmin) {

    window.location.href =
        "login.html";

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

            loadResidents();

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

    const name =
        admin.username ||
        "Administrator";

    const initials =
        getInitials(name);

    adminInitials.textContent =
        initials;
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
// Load Residents
// ==========================================

async function loadResidents() {

    showLoadingState();

    clearMessages();

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/residents`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to retrieve residents."
            );
        }

        residents =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.residents)
                        ? data.residents
                        : []
                );

        updateStatistics();

        applyFilters();

    } catch (error) {

        console.error(
            "Residents API error:",
            error
        );

        showError(
            error.message ||
            "Unable to load residents. Make sure the TownCare backend is running."
        );

        residentList.innerHTML =
            `<div class="empty-state">
                Unable to load resident accounts.
            </div>`;
    }
}


// ==========================================
// Update Statistics
// ==========================================

function updateStatistics() {

    const total =
        residents.length;

    const pending =
        residents.filter(
            (resident) =>
                String(resident.status)
                    .toLowerCase() === "pending"
        ).length;

    const approved =
        residents.filter(
            (resident) =>
                String(resident.status)
                    .toLowerCase() === "approved"
        ).length;

    const rejected =
        residents.filter(
            (resident) =>
                String(resident.status)
                    .toLowerCase() === "rejected"
        ).length;


    totalResidents.textContent =
        formatNumber(total);

    pendingResidents.textContent =
        formatNumber(pending);

    approvedResidents.textContent =
        formatNumber(approved);

    rejectedResidents.textContent =
        formatNumber(rejected);
}


// ==========================================
// Number Formatting
// ==========================================

function formatNumber(value) {

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return "0";
    }

    return number.toLocaleString(
        "en-IN"
    );
}


// ==========================================
// Apply Search + Status Filter
// ==========================================

function applyFilters() {

    const searchTerm =
        residentSearch.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value
            .toLowerCase();


    const filteredResidents =
        residents.filter(
            (resident) => {

                const name =
                    String(
                        resident.username || ""
                    ).toLowerCase();

                const houseNo =
                    String(
                        resident.house_no || ""
                    ).toLowerCase();

                const phoneNo =
                    String(
                        resident.phone_no || ""
                    ).toLowerCase();

                const residentStatus =
                    String(
                        resident.status || ""
                    ).toLowerCase();


                const matchesSearch =
                    searchTerm === "" ||
                    name.includes(searchTerm) ||
                    houseNo.includes(searchTerm) ||
                    phoneNo.includes(searchTerm);


                const matchesStatus =
                    selectedStatus === "all" ||
                    residentStatus === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderResidents(
        filteredResidents
    );
}


// ==========================================
// Render Residents
// ==========================================

function renderResidents(
    residentRecords
) {

    if (
        !Array.isArray(residentRecords) ||
        residentRecords.length === 0
    ) {

        residentList.innerHTML =
            `<div class="empty-state">
                No resident accounts found.
            </div>`;

        return;
    }


    residentList.innerHTML =
        residentRecords
            .map(
                (resident) =>
                    createResidentCard(
                        resident
                    )
            )
            .join("");
}


// ==========================================
// Create Resident Card
// ==========================================

function createResidentCard(
    resident
) {

    const status =
        String(
            resident.status || ""
        ).toLowerCase();

    const statusText =
        capitalizeFirstLetter(
            status
        );


    const actionButtons =
        status === "pending"
            ? `
                <div class="resident-actions">

                    <button
                        type="button"
                        class="action-btn approve"
                        data-action="approve"
                        data-id="${escapeAttribute(
                            resident.id
                        )}"
                    >
                        Approve
                    </button>

                    <button
                        type="button"
                        class="action-btn reject"
                        data-action="reject"
                        data-id="${escapeAttribute(
                            resident.id
                        )}"
                    >
                        Reject
                    </button>

                </div>
            `
            : "";


    return `
        <article class="resident-card">

            <div class="resident-card-top">

                <div class="resident-identity">

                    <div class="resident-name">
                        ${escapeHTML(
                            resident.username ||
                            "Resident"
                        )}
                    </div>

                    <div class="resident-house">
                        House No.:
                        ${escapeHTML(
                            resident.house_no ||
                            "N/A"
                        )}
                    </div>

                </div>

                <span
                    class="resident-status ${getResidentStatusClass(
                        status
                    )}"
                >
                    ${escapeHTML(
                        statusText ||
                        "Unknown"
                    )}
                </span>

            </div>


            <div class="resident-details">

                <div class="detail-item">

                    <div class="detail-label">
                        Mobile Number
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            resident.phone_no ||
                            "N/A"
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Role
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            resident.role ||
                            "resident"
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Registered On
                    </div>

                    <div class="detail-value">
                        ${formatDate(
                            resident.created_at
                        )}
                    </div>

                </div>

            </div>


            ${actionButtons}

        </article>
    `;
}


// ==========================================
// Status Class
// ==========================================

function getResidentStatusClass(
    status
) {

    switch (status) {

        case "pending":
            return "pending";

        case "approved":
            return "approved";

        case "rejected":
            return "rejected";

        default:
            return "";
    }
}


// ==========================================
// Approve / Reject Resident
// ==========================================

async function updateResidentStatus(
    residentId,
    newStatus,
    button
) {

    if (!residentId) {

        showError(
            "Invalid resident ID."
        );

        return;
    }


    if (
        newStatus !== "approved" &&
        newStatus !== "rejected"
    ) {

        showError(
            "Invalid resident status."
        );

        return;
    }


    clearMessages();


    const originalText =
        button.textContent;

    button.disabled = true;

    button.textContent =
        newStatus === "approved"
            ? "Approving..."
            : "Rejecting...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/residents/${encodeURIComponent(
                    residentId
                )}/status`,
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
                "Unable to update resident status."
            );
        }


        showSuccess(
            data.message ||
            `Resident account ${newStatus} successfully.`
        );


        await loadResidents();


    } catch (error) {

        console.error(
            "Resident status update error:",
            error
        );

        showError(
            error.message ||
            "Unable to update resident status."
        );


        button.disabled = false;

        button.textContent =
            originalText;
    }
}


// ==========================================
// Resident List Click Handler
// ==========================================

residentList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-action]"
            );

        if (!button) {
            return;
        }


        const action =
            button.dataset.action;

        const residentId =
            button.dataset.id;


        if (action === "approve") {

            updateResidentStatus(
                residentId,
                "approved",
                button
            );

        }


        if (action === "reject") {

            updateResidentStatus(
                residentId,
                "rejected",
                button
            );

        }

    }
);


// ==========================================
// Search Event
// ==========================================

residentSearch.addEventListener(
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
// Date Formatting
// ==========================================

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "N/A";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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
// Capitalize First Letter
// ==========================================

function capitalizeFirstLetter(
    value
) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


// ==========================================
// HTML Safety
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// Attribute Safety
// ==========================================

function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );
}


// ==========================================
// Loading State
// ==========================================

function showLoadingState() {

    residentList.innerHTML =
        `<div class="loading-state">
            Loading residents...
        </div>`;
}


// ==========================================
// Error Message
// ==========================================

function showError(
    message
) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

    successMessage.textContent =
        "";

    successMessage.style.display =
        "none";
}


// ==========================================
// Success Message
// ==========================================

function showSuccess(
    message
) {

    successMessage.textContent =
        message;

    successMessage.style.display =
        "block";

    errorMessage.textContent =
        "";

    errorMessage.style.display =
        "none";
}


// ==========================================
// Clear Messages
// ==========================================

function clearMessages() {

    errorMessage.textContent =
        "";

    errorMessage.style.display =
        "none";

    successMessage.textContent =
        "";

    successMessage.style.display =
        "none";
}


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