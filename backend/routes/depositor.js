const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all depositors
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM depositor');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a depositor
router.post('/', async (req, res) => {
  const { customer_id, account_number } = req.body;
  try {
    await db.query(
      'INSERT INTO depositor (customer_id, account_number) VALUES ($1, $2)',
      [customer_id, account_number]
    );
    res.status(201).json({ message: 'Depositor added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
