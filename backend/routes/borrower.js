const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all borrowers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM borrower');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a borrower
router.post('/', async (req, res) => {
  const { customer_id, loan_number } = req.body;
  try {
    await db.query(
      'INSERT INTO borrower (customer_id, loan_number) VALUES ($1, $2)',
      [customer_id, loan_number]
    );
    res.status(201).json({ message: 'Borrower added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
