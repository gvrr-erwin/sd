// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

// Create Express app
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Enable body parsing for URL-encoded and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve HTML file on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle POST requests for form submissions
app.post('/submit', async (req, res) => {
  try {
    // Read existing data from JSON file
    const filePath = path.join(__dirname, 'data.json');
    const rawData = await fs.readFile(filePath);
    const data = JSON.parse(rawData);

    // Extract form data
    const { type, name, amount, date } = req.body;

    // Create transaction object
    const transaction = {
      type: type === 'on' ? 'income' : 'expense',
      name: name,
      amount: parseFloat(amount),
      date: date,
    };

    // Update data array
    data.transactions.push(transaction);

    // Update JSON file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    // Respond with success
    res.status(200).send('Transaction saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Your existing snew.js and chart.js code follows below...

// ... (snew.js code)
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

// Function to add a new transaction
function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);

  const rawDate = formData.get("date");
  const dateArray = rawDate.split('-');
  const formattedDate = `${dateArray[0]}-${dateArray[1]}-${dateArray[2]}`;

  const newTransaction = {
    id: transactions.length + 1,
    name: formData.get("name") || "",
    amount: parseFloat(formData.get("amount")),
    date: formattedDate,
    type: formData.get("type") === "on" ? "income" : "expense", // Adjust this line
  };

  transactions.push(newTransaction);

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();

  toggleButton.addEventListener("click", () => {
    showAllTransactions = !showAllTransactions;
    renderList();
  });

  toggleButton.addEventListener("click", () => {
    list.classList.toggle("show");
    renderList();
  });

  axios.post('/submit', newTransaction)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
}



function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  localStorage.setItem("transactions", JSON.stringify(transactions));
}
// ... (chart.js code)
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/submit', async (req, res) => {
  try {
    // Read existing data from JSON file or initialize with an empty array
    const filePath = path.join(__dirname, 'data.json');
    let rawData = '[]';
    try {
      rawData = await fs.readFile(filePath);
    } catch (readError) {
      // If the file doesn't exist or cannot be read, handle the error here
      console.error(readError);
    }

    const data = JSON.parse(rawData);

    // Extract form data
    const { type, name, amount, date } = req.body;

    const typeCheckbox = type;
    const transactionType = typeCheckbox.checked ? 'income' : 'expense';

    // Create transaction object
    const transaction = {
      type: transactionType, // Adjust the type value
      name: name,
      amount: parseFloat(amount),
      date: date,
    };

    // Ensure data.transactions is an array
    data.transactions = data.transactions || [];

    // Update data array
    data.transactions.push(transaction);

    // Update JSON file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    // Respond with success
    res.status(200).send('Transaction saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addTransaction,
  };
}

// ... (your existing code)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
