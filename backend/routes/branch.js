const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all customer-banker relationships
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cust_banker');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a customer-banker relationship
router.post('/', async (req, res) => {
  const { customer_id, employee_id } = req.body;
  try {
    await db.query(
      'INSERT INTO cust_banker (customer_id, employee_id) VALUES ($1, $2)',
      [customer_id, employee_id]
    );
    res.status(201).json({ message: 'Customer-Banker relationship added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
