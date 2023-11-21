let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP", // Change this to the appropriate PESO currency code (e.g., "MXN" for Mexican Peso)
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const toggleButton = document.getElementById("toggleTransactionsButton");

form.addEventListener("submit", addTransaction);
toggleButton.addEventListener("click", toggleTransactions);

let showAllTransactions = false;

function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - (expenseTotal * -1);

  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";
  status.textContent = "";

  const transactionsToDisplay = showAllTransactions ? transactions : transactions.slice(0, 3);

  if (transactions.length === 0) {
    status.textContent = "No transactions";
    toggleButton.style.display = "none";
    return;
  }

  transactionsToDisplay.forEach(({ id, name, amount, date, type }) => {
    const sign = "income" === type ? 1 : -1;

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id}); removeData(eChart);">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li);
  });

  toggleButton.style.display = transactions.length > 3 ? "block" : "none";
}

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);

  const newTransaction = {
    type: formData.get("type") === "on" ? "income" : "expense",
    name: formData.get("name") || "",
    amount: parseFloat(formData.get("amount")),
    date: formData.get("date") || "",
  };

  transactions.push(newTransaction);

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();

  // Send the new transaction to the server
  axios.post('/submit', newTransaction)
    .then((response) => {
      console.log(response.data); // Log the server response if needed
    })
    .catch((error) => {
      console.error(error);
    });
}




function toggleTransactions() {
  showAllTransactions = !showAllTransactions;
  renderList();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}
function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);

  const rawDate = formData.get("date");
  const dateArray = rawDate.split('-'); // Assuming the date is in the format "YYYY-MM-DD"
  const formattedDate = `${dateArray[0]}-${dateArray[1]}-${dateArray[2]}`; // Format as "YYYY-MM-DD"

  const newTransaction = {
    id: transactions.length + 1,
    name: formData.get("name") || "", // Use an empty string if name is not provided
    amount: parseFloat(formData.get("amount")),
    date: formattedDate, // Use the formatted date
    type: formData.get("type") === "on" ? "income" : "expense",
  };

  transactions.push(newTransaction);

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();

  toggleButton.addEventListener("click", () => { //add event listener to determine if hide button has been clicked to hide transaction
    showAllTransactions = !showAllTransactions;
    renderList();
  });
  toggleButton.addEventListener("click", () => {
    list.classList.toggle("show");
    renderList();
  })
  // Send the new transaction to the server
  axios.post('/submit', newTransaction)
    .then((response) => {
      console.log(response.data); // Log the server response if needed
    })
    .catch((error) => {
      console.error(error);
    });
}


function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  localStorage.setItem("transactions", JSON.stringify(transactions));
}