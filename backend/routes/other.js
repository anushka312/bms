const express = require('express');
const router = express.Router();
const db = require('../db');

// All accounts for a customer
router.get('/customer/:id/accounts', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.* FROM account a
       JOIN depositor d ON a.account_number = d.account_number
       WHERE d.customer_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All loans for a customer
router.get('/customer/:id/loans', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.* FROM loan l
       JOIN borrower b ON l.loan_number = b.loan_number
       WHERE b.customer_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accounts at a specific branch
router.get('/branches/:name/accounts', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.* FROM account a
       JOIN branch b ON a.branch_name = b.branch_name
       WHERE b.branch_name = $1`,
      [req.params.name]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customers handled by an employee
router.get('/employees/:id/customer', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.* FROM customer c
       JOIN cust_banker cb ON c.customer_id = cb.customer_id
       WHERE cb.employee_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Payments made for a loan
router.get('/loans/:id/payments', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM payment WHERE loan_number = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
