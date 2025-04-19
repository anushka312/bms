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

// Get a list of customers by employee_id 
router.get('/:employee_id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cust_banker WHERE employee_id = $1', [req.params.employee_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No customers found for this employee' });
    }
    res.json(result.rows); // Return the list of customers assigned to this employee
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a customer-banker relationship by customer_id (This is a more general route)
router.get('/customer/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cust_banker WHERE customer_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No account found for this customer' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a customer-banker relationship
router.post('/', async (req, res) => {
  const { customer_id, employee_id, type } = req.body; // Added account_type
  try {
    // Insert the customer-banker relationship with account type
    await db.query(
      'INSERT INTO cust_banker (customer_id, employee_id, type) VALUES ($1, $2, $3)', // account_type added here
      [customer_id, employee_id, type]
    );
    res.status(201).json({ message: 'Customer-Banker relationship added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
