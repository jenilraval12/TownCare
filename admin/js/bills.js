// ==========================================
// TownCare - Admin Bills
// ==========================================

const API_URL = "http://localhost:3000";


// ==========================================
// Elements
// ==========================================

const adminInitials =
    document.getElementById("adminInitials");

const totalBills =
    document.getElementById("totalBills");

const pendingBills =
    document.getElementById("pendingBills");

const paidBills =
    document.getElementById("paidBills");

const pendingAmount =
    document.getElementById("pendingAmount");

const billForm =
    document.getElementById("billForm");

const residentId =
    document.getElementById("residentId");

const billType =
    document.getElementById("billType");

const billMonth =
    document.getElementById("billMonth");

const billYear =
    document.getElementById("billYear");

const billAmount =
    document.getElementById("billAmount");

const dueDate =
    document.getElementById("dueDate");

const createBillButton =
    document.getElementById("createBillButton");

const billSearch =
    document.getElementById("billSearch");

const billStatusFilter =
    document.getElementById("billStatusFilter");

const billList =
    document.getElementById("billList");

const formErrorMessage =
    document.getElementById("formErrorMessage");

const formSuccessMessage =
    document.getElementById("formSuccessMessage");

const listErrorMessage =
    document.getElementById("listErrorMessage");

const listSuccessMessage =
    document.getElementById("listSuccessMessage");

const logoutLink =
    document.getElementById("logoutLink");


// ==========================================
// Data
// ==========================================

let bills = [];

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

            initializePage();

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
// Initialize Page
// ==========================================

async function initializePage() {

    setDefaultYear();

    await Promise.all([
        loadResidents(),
        loadBills()
    ]);

}


// ==========================================
// Display Admin Initials
// ==========================================

function displayAdminInitials(admin) {

    const name =
        admin.username ||
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
// Set Default Year
// ==========================================

function setDefaultYear() {

    const currentYear =
        new Date().getFullYear();

    billYear.value =
        currentYear;

}


// ==========================================
// Load Residents
// ==========================================

async function loadResidents() {

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
                "Unable to load residents."
            );

        }

        const allResidents =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.residents)
                        ? data.residents
                        : []
                );


        residents =
            allResidents.filter(
                (resident) =>
                    resident.role === "resident" &&
                    resident.status === "approved"
            );


        populateResidentDropdown();


    } catch (error) {

        console.error(
            "Residents API error:",
            error
        );

        residentId.innerHTML =
            `
                <option value="">
                    Unable to load residents
                </option>
            `;

        showFormError(
            error.message ||
            "Unable to load approved residents."
        );

    }

}


// ==========================================
// Populate Resident Dropdown
// ==========================================

function populateResidentDropdown() {

    residentId.innerHTML =
        `
            <option value="">
                Select resident
            </option>
        `;


    if (residents.length === 0) {

        residentId.innerHTML =
            `
                <option value="">
                    No approved residents available
                </option>
            `;

        return;
    }


    residents.forEach(
        (resident) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                resident.id;


            const residentName =
                resident.username ||
                "Resident";


            const houseNo =
                resident.house_no ||
                "N/A";


            option.textContent =
                `${residentName} - House ${houseNo}`;


            residentId.appendChild(
                option
            );

        }
    );

}


// ==========================================
// Load Bills
// ==========================================

async function loadBills() {

    showBillLoadingState();

    clearListMessages();

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/bills`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load bills."
            );

        }


        bills =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(data.bills)
                        ? data.bills
                        : []
                );


        updateBillStatistics();

        applyBillFilters();


    } catch (error) {

        console.error(
            "Bills API error:",
            error
        );

        showListError(
            error.message ||
            "Unable to load bills. Make sure the TownCare backend is running."
        );


        billList.innerHTML =
            `
                <div class="empty-state">
                    Unable to load bills.
                </div>
            `;

    }

}


// ==========================================
// Bill Statistics
// ==========================================

function updateBillStatistics() {

    const total =
        bills.length;


    const pending =
        bills.filter(
            (bill) =>
                bill.status === "Pending"
        ).length;


    const paid =
        bills.filter(
            (bill) =>
                bill.status === "Paid"
        ).length;


    const totalPendingAmount =
        bills
            .filter(
                (bill) =>
                    bill.status === "Pending"
            )
            .reduce(
                (
                    totalAmount,
                    bill
                ) => {

                    const amount =
                        Number(
                            bill.amount
                        );

                    return (
                        totalAmount +
                        (
                            Number.isNaN(amount)
                                ? 0
                                : amount
                        )
                    );

                },
                0
            );


    totalBills.textContent =
        formatNumber(total);

    pendingBills.textContent =
        formatNumber(pending);

    paidBills.textContent =
        formatNumber(paid);

    pendingAmount.textContent =
        formatCurrency(
            totalPendingAmount
        );

}


// ==========================================
// Search + Filter
// ==========================================

function applyBillFilters() {

    const searchTerm =
        billSearch.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        billStatusFilter.value;


    const filteredBills =
        bills.filter(
            (bill) => {

                const residentName =
                    String(
                        bill.username || ""
                    ).toLowerCase();


                const houseNo =
                    String(
                        bill.house_no || ""
                    ).toLowerCase();


                const phoneNo =
                    String(
                        bill.phone_no || ""
                    ).toLowerCase();


                const billTypeValue =
                    String(
                        bill.bill_type || ""
                    ).toLowerCase();


                const month =
                    String(
                        bill.month || ""
                    ).toLowerCase();


                const year =
                    String(
                        bill.year || ""
                    ).toLowerCase();


                const matchesSearch =
                    searchTerm === "" ||
                    residentName.includes(
                        searchTerm
                    ) ||
                    houseNo.includes(
                        searchTerm
                    ) ||
                    phoneNo.includes(
                        searchTerm
                    ) ||
                    billTypeValue.includes(
                        searchTerm
                    ) ||
                    month.includes(
                        searchTerm
                    ) ||
                    year.includes(
                        searchTerm
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    bill.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderBills(
        filteredBills
    );

}


// ==========================================
// Render Bills
// ==========================================

function renderBills(
    billRecords
) {

    if (
        !Array.isArray(billRecords) ||
        billRecords.length === 0
    ) {

        billList.innerHTML =
            `
                <div class="empty-state">
                    No bills found.
                </div>
            `;

        return;
    }


    billList.innerHTML =
        billRecords
            .map(
                (bill) =>
                    createBillCard(
                        bill
                    )
            )
            .join("");

}


// ==========================================
// Create Bill Card
// ==========================================

function createBillCard(
    bill
) {

    const status =
        bill.status || "Pending";


    const statusClass =
        status.toLowerCase() === "paid"
            ? "paid"
            : "pending";


    const amount =
        Number(
            bill.amount
        );


    return `
        <article class="bill-item">


            <!-- Bill Header -->

            <div class="bill-top">

                <div class="bill-heading">

                    <div class="bill-type">
                        ${escapeHTML(
                            bill.bill_type ||
                            "Maintenance Bill"
                        )}
                    </div>

                    <div class="bill-id">
                        Bill ID:
                        #${escapeHTML(
                            bill.id
                        )}
                    </div>

                </div>


                <span
                    class="bill-status ${statusClass}"
                >
                    ${escapeHTML(
                        status
                    )}
                </span>

            </div>


            <!-- Bill Amount -->

            <div class="bill-amount-section">

                <div class="bill-amount-label">
                    Bill Amount
                </div>

                <div class="bill-amount">
                    ${formatCurrency(
                        Number.isNaN(amount)
                            ? 0
                            : amount
                    )}
                </div>

            </div>


            <!-- Bill Details -->

            <div class="bill-details">


                <div class="detail-item">

                    <div class="detail-label">
                        Month
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            bill.month ||
                            "N/A"
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Year
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            bill.year ||
                            "N/A"
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Due Date
                    </div>

                    <div class="detail-value">
                        ${formatDate(
                            bill.due_date
                        )}
                    </div>

                </div>


                <div class="detail-item">

                    <div class="detail-label">
                        Payment Date
                    </div>

                    <div class="detail-value">
                        ${
                            bill.payment_date
                                ? formatDate(
                                    bill.payment_date
                                )
                                : "Not Paid"
                        }
                    </div>

                </div>


            </div>


            <!-- Resident Information -->

            <div class="resident-information">

                <span>
                    Resident:
                    <strong>
                        ${escapeHTML(
                            bill.username ||
                            "N/A"
                        )}
                    </strong>
                </span>


                <span>
                    House:
                    <strong>
                        ${escapeHTML(
                            bill.house_no ||
                            "N/A"
                        )}
                    </strong>
                </span>


                <span>
                    Mobile:
                    <strong>
                        ${escapeHTML(
                            bill.phone_no ||
                            "N/A"
                        )}
                    </strong>
                </span>

            </div>


            <!-- Bill Actions -->

            <div
                class="bill-actions"
                data-bill-id="${escapeAttribute(
                    bill.id
                )}"
            >

                <select
                    class="bill-status-select"
                    aria-label="Bill status"
                >

                    <option
                        value="Pending"
                        ${
                            status === "Pending"
                                ? "selected"
                                : ""
                        }
                    >
                        Pending
                    </option>

                    <option
                        value="Paid"
                        ${
                            status === "Paid"
                                ? "selected"
                                : ""
                        }
                    >
                        Paid
                    </option>

                </select>


                <button
                    type="button"
                    class="update-button"
                    data-action="update-status"
                    data-id="${escapeAttribute(
                        bill.id
                    )}"
                >
                    Update Status
                </button>

            </div>


        </article>
    `;

}


// ==========================================
// Create New Bill
// ==========================================

billForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearFormMessages();


        const selectedResidentId =
            residentId.value.trim();


        const enteredBillType =
            billType.value.trim();


        const selectedMonth =
            billMonth.value;


        const enteredYear =
            billYear.value.trim();


        const enteredAmount =
            billAmount.value.trim();


        const selectedDueDate =
            dueDate.value;


        // ==================================
        // Resident Validation
        // ==================================

        if (
            selectedResidentId === ""
        ) {

            showFormError(
                "Please select a resident."
            );

            residentId.focus();

            return;
        }


        // ==================================
        // Bill Type Validation
        // ==================================

        if (
            enteredBillType === ""
        ) {

            showFormError(
                "Please enter the bill type."
            );

            billType.focus();

            return;
        }


        if (
            enteredBillType.length < 2
        ) {

            showFormError(
                "Bill type must contain at least 2 characters."
            );

            billType.focus();

            return;
        }


        // ==================================
        // Month Validation
        // ==================================

        if (
            selectedMonth === ""
        ) {

            showFormError(
                "Please select the bill month."
            );

            billMonth.focus();

            return;
        }


        // ==================================
        // Year Validation
        // ==================================

        const yearNumber =
            Number(
                enteredYear
            );


        if (
            enteredYear === "" ||
            !Number.isInteger(
                yearNumber
            ) ||
            yearNumber < 2000 ||
            yearNumber > 2100
        ) {

            showFormError(
                "Please enter a valid year."
            );

            billYear.focus();

            return;
        }


        // ==================================
        // Amount Validation
        // ==================================

        const amountNumber =
            Number(
                enteredAmount
            );


        if (
            enteredAmount === "" ||
            Number.isNaN(
                amountNumber
            ) ||
            amountNumber < 0
        ) {

            showFormError(
                "Please enter a valid bill amount."
            );

            billAmount.focus();

            return;
        }


        // ==================================
        // Due Date Validation
        // ==================================

        if (
            selectedDueDate === ""
        ) {

            showFormError(
                "Please select a due date."
            );

            dueDate.focus();

            return;
        }


        // ==================================
        // Submit Bill
        // ==================================

        createBillButton.disabled =
            true;


        const originalButtonText =
            createBillButton.textContent;


        createBillButton.textContent =
            "Creating...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin/bills`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                user_id:
                                    Number(
                                        selectedResidentId
                                    ),

                                bill_type:
                                    enteredBillType,

                                month:
                                    selectedMonth,

                                year:
                                    yearNumber,

                                amount:
                                    amountNumber,

                                due_date:
                                    selectedDueDate

                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to create bill."
                );

            }


            showFormSuccess(
                data.message ||
                "Bill created successfully."
            );


            resetBillForm();


            await loadBills();


        } catch (error) {

            console.error(
                "Create bill error:",
                error
            );


            showFormError(
                error.message ||
                "Unable to create bill."
            );

        } finally {

            createBillButton.disabled =
                false;

            createBillButton.textContent =
                originalButtonText;

        }

    }
);


// ==========================================
// Update Bill Status
// ==========================================

async function updateBillStatus(
    billId,
    container,
    button
) {

    if (!billId) {

        showListError(
            "Invalid bill ID."
        );

        return;
    }


    const statusSelect =
        container.querySelector(
            ".bill-status-select"
        );


    if (!statusSelect) {

        showListError(
            "Unable to find bill status."
        );

        return;
    }


    const status =
        statusSelect.value;


    if (
        status !== "Pending" &&
        status !== "Paid"
    ) {

        showListError(
            "Invalid bill status."
        );

        return;
    }


    clearListMessages();


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Updating...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/bills/${encodeURIComponent(
                    billId
                )}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status:
                                status
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update bill status."
            );

        }


        showListSuccess(
            data.message ||
            "Bill status updated successfully."
        );


        await loadBills();


    } catch (error) {

        console.error(
            "Bill status update error:",
            error
        );


        showListError(
            error.message ||
            "Unable to update bill status."
        );


        button.disabled =
            false;

        button.textContent =
            originalText;

    }

}


// ==========================================
// Bill List Click Handler
// ==========================================

billList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                '[data-action="update-status"]'
            );


        if (!button) {
            return;
        }


        const billId =
            button.dataset.id;


        const container =
            button.closest(
                ".bill-actions"
            );


        if (!container) {

            showListError(
                "Unable to find bill update section."
            );

            return;
        }


        updateBillStatus(
            billId,
            container,
            button
        );

    }
);


// ==========================================
// Search Event
// ==========================================

billSearch.addEventListener(
    "input",
    function () {

        applyBillFilters();

    }
);


// ==========================================
// Status Filter Event
// ==========================================

billStatusFilter.addEventListener(
    "change",
    function () {

        applyBillFilters();

    }
);


// ==========================================
// Reset Bill Form
// ==========================================

function resetBillForm() {

    billForm.reset();

    setDefaultYear();

    populateResidentDropdown();

}


// ==========================================
// Currency Formatting
// ==========================================

function formatCurrency(
    amount
) {

    const number =
        Number(amount);


    if (
        Number.isNaN(number)
    ) {

        return "₹0.00";
    }


    return (
        "₹" +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        )
    );

}


// ==========================================
// Number Formatting
// ==========================================

function formatNumber(
    value
) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "0";
    }


    return number.toLocaleString(
        "en-IN"
    );

}


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
        new Date(
            dateValue
        );


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

function showBillLoadingState() {

    billList.innerHTML =
        `
            <div class="loading-state">
                Loading bills...
            </div>
        `;

}


// ==========================================
// Form Error
// ==========================================

function showFormError(
    message
) {

    formErrorMessage.textContent =
        message;

    formErrorMessage.style.display =
        "block";

    formSuccessMessage.textContent =
        "";

    formSuccessMessage.style.display =
        "none";

}


// ==========================================
// Form Success
// ==========================================

function showFormSuccess(
    message
) {

    formSuccessMessage.textContent =
        message;

    formSuccessMessage.style.display =
        "block";

    formErrorMessage.textContent =
        "";

    formErrorMessage.style.display =
        "none";

}


// ==========================================
// List Error
// ==========================================

function showListError(
    message
) {

    listErrorMessage.textContent =
        message;

    listErrorMessage.style.display =
        "block";

    listSuccessMessage.textContent =
        "";

    listSuccessMessage.style.display =
        "none";

}


// ==========================================
// List Success
// ==========================================

function showListSuccess(
    message
) {

    listSuccessMessage.textContent =
        message;

    listSuccessMessage.style.display =
        "block";

    listErrorMessage.textContent =
        "";

    listErrorMessage.style.display =
        "none";

}


// ==========================================
// Clear Form Messages
// ==========================================

function clearFormMessages() {

    formErrorMessage.textContent =
        "";

    formErrorMessage.style.display =
        "none";

    formSuccessMessage.textContent =
        "";

    formSuccessMessage.style.display =
        "none";

}


// ==========================================
// Clear List Messages
// ==========================================

function clearListMessages() {

    listErrorMessage.textContent =
        "";

    listErrorMessage.style.display =
        "none";

    listSuccessMessage.textContent =
        "";

    listSuccessMessage.style.display =
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