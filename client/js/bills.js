// ==========================================
// TownCare - Bills
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

const profileButton = document.querySelector(".profile-button");

if (profileButton && user.username) {
  const initials = user.username
    .trim()
    .split(/\s+/)
    .map(function (name) {
      return name.charAt(0);
    })
    .join("")
    .substring(0, 2)
    .toUpperCase();

  profileButton.textContent = initials;
}

// ==========================================
// Bill Records
// ==========================================

let payments = [];

// ==========================================
// Get HTML Elements
// ==========================================

const paymentList = document.getElementById("paymentList");
const noPayments = document.getElementById("noPayments");
const yearFilter = document.getElementById("yearFilter");

const currentBillType = document.getElementById("currentBillType");
const currentBillMonth = document.getElementById("currentBillMonth");
const currentBillAmount = document.getElementById("currentBillAmount");
const currentBillHouse = document.getElementById("currentBillHouse");
const currentBillDueDate = document.getElementById("currentBillDueDate");
const currentBillingMonth = document.getElementById("currentBillingMonth");
const currentBillStatus = document.getElementById("currentBillStatus");

const billModal = document.getElementById("billModal");

const closeBillModal = document.getElementById("closeBillModal");

const closeBillButton = document.getElementById("closeBillButton");

const modalMonth = document.getElementById("modalBillMonth");

const modalAmount = document.getElementById("modalBillAmount");

const modalPaymentDate = document.getElementById("modalPaymentDate");

const modalDueDate = document.getElementById("modalDueDate");

const modalStatus = document.getElementById("modalBillStatus");

const modalHouseNo = document.getElementById("modalHouseNumber");

// ==========================================
// Format Date
// ==========================================

function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  const value = String(dateString);

  const datePart = value.includes("T") ? value.split("T")[0] : value;

  const parts = datePart.split("-");

  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  const fallbackDate = new Date(dateString);

  if (!Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return "-";
}

// ==========================================
// Load Bills From MySQL
// ==========================================

async function loadBills() {
  try {
    const response = await fetch(`${API_URL}/api/bills/${user.id}`);

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Unable to load your bills.");

      return;
    }

    payments = Array.isArray(data.bills)
      ? data.bills.map(function (bill) {
          return {
            id: bill.id,
            billType: bill.bill_type,
            month: bill.month,
            year: Number(bill.year),
            amount: Number(bill.amount),
            dueDate: bill.due_date,
            paymentDate: bill.payment_date,
            status: bill.status,
            houseNo: user.house_no,
          };
        })
      : [];

    displayCurrentBill(payments[0]);
    function displayCurrentBill(bill) {
      if (!bill) {
        currentBillType.textContent = "No Bill";
        currentBillMonth.textContent = "No Current Bill";
        currentBillAmount.textContent = "₹0";
        currentBillHouse.textContent = user.house_no || "-";
        currentBillDueDate.textContent = "-";
        currentBillingMonth.textContent = "-";

        currentBillStatus.textContent = "No Record";
        currentBillStatus.className = "bill-status";

        return;
      }

      currentBillType.textContent = bill.billType || "Maintenance Bill";

      currentBillMonth.textContent = `${bill.month} ${bill.year}`;

      currentBillAmount.textContent = `₹${Number(bill.amount).toLocaleString("en-IN")}`;

      currentBillHouse.textContent = bill.houseNo || "-";

      currentBillDueDate.textContent = formatDate(bill.dueDate);

      currentBillingMonth.textContent = `${bill.month} ${bill.year}`;

      const statusClass =
        String(bill.status || "").toLowerCase() === "paid" ? "paid" : "pending";

      currentBillStatus.textContent = bill.status || "Pending";

      currentBillStatus.className = `bill-status ${statusClass}`;
    }

    displayPayments(payments);
  } catch (error) {
    console.error("Bills Error:", error);

    alert(
      "Unable to connect to the server. Make sure your TownCare backend is running.",
    );
  }
}

// ==========================================
// Display Payment Records
// ==========================================

function displayPayments(records) {
  paymentList.innerHTML = "";

  if (records.length === 0) {
    noPayments.style.display = "block";

    return;
  }

  noPayments.style.display = "none";

  records.forEach(function (payment) {
    const paymentCard = document.createElement("div");

    paymentCard.className = "payment-card";

    const statusClass =
      String(payment.status || "").toLowerCase() === "paid"
        ? "paid"
        : "pending";

    const formattedAmount = Number(payment.amount).toLocaleString("en-IN");

    paymentCard.innerHTML = `

            <div class="payment-top">

                <div>

                    <h3>
                        ${payment.month} ${payment.year}
                    </h3>

                    <p>
                        ${payment.billType || "Maintenance Bill"}
                    </p>

                </div>


<span class="bill-status ${statusClass}">
    ${payment.status}
</span>

            </div>


            <div class="payment-amount">

                ₹${formattedAmount}

            </div>


            <div class="payment-info">

                <div>

                    <span>
                        Payment Date
                    </span>

                    <strong>
                        ${formatDate(payment.paymentDate)}
                    </strong>

                </div>


                <div>

                    <span>
                        Due Date
                    </span>

                    <strong>
                        ${formatDate(payment.dueDate)}
                    </strong>

                </div>

            </div>


            <button
                class="view-details-button"
                onclick="viewBillDetails(${payment.id})"
            >

                View Details

            </button>

        `;

    paymentList.appendChild(paymentCard);
  });
}

// ==========================================
// Filter by Year
// ==========================================

function filterPayments() {
  const selectedYear = yearFilter.value;

  if (selectedYear === "all") {
    displayPayments(payments);

    return;
  }

  const filteredPayments = payments.filter(function (payment) {
    return payment.year.toString() === selectedYear;
  });

  displayPayments(filteredPayments);
}

// ==========================================
// Open Bill Details Modal
// ==========================================

function viewBillDetails(id) {
  const payment = payments.find(function (item) {
    return item.id === id;
  });

  if (!payment) {
    return;
  }

  modalMonth.textContent = `${payment.month} ${payment.year}`;

  modalAmount.textContent = `₹${Number(payment.amount).toLocaleString("en-IN")}`;

  modalPaymentDate.textContent = formatDate(payment.paymentDate);

  modalDueDate.textContent = formatDate(payment.dueDate);

  modalHouseNo.textContent = user.house_no;

  modalStatus.textContent = payment.status;

  billModal.style.display = "flex";
}

// ==========================================
// Close Modal
// ==========================================

function closeBillDetailsModal() {
  billModal.style.display = "none";
}

closeBillModal.addEventListener("click", closeBillDetailsModal);

closeBillButton.addEventListener("click", closeBillDetailsModal);

// ==========================================
// Close Modal When Clicking Outside
// ==========================================

window.addEventListener("click", function (event) {
  if (event.target === billModal) {
    billModal.style.display = "none";
  }
});

// ==========================================
// Year Filter Event
// ==========================================

yearFilter.addEventListener("change", filterPayments);

// ==========================================
// Initial Load
// ==========================================

loadBills();
