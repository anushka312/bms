const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all borrowers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Borrower');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a borrower 
router.post('/', async (req, res) => {
  const { customer_id, loan_number } = req.body;

  try {
    // Check if loan exists first
    const loanResult = await db.query('SELECT loan_number FROM Loan WHERE loan_number = $1', [loan_number]);
    if (loanResult.rows.length === 0) {
      return res.status(400).json({ message: 'Loan not found' });
    }

    // Insert borrower
    await db.query(
      'INSERT INTO Borrower (customer_id, loan_number) VALUES ($1, $2)',
      [customer_id, loan_number]
    );

    res.status(201).json({ message: 'Borrower added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
