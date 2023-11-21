const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

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
      console.error(readError);
    }

    const data = JSON.parse(rawData);

    // Extract form data
    const { type, name, amount, date } = req.body;

    // Create transaction object
    const transaction = {
      type: type, // Adjust this line
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




// ... (your existing code)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
