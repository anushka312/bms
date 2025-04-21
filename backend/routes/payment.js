const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// POST /payment/:loan_number
router.post('/:loan_number', async (req, res) => {
  const loanNumber = req.params.loan_number;
  const { payment_number, payment_amount } = req.body;

  try {
    // Fetch the payment details to check if it exists
    const paymentRes = await db.query(
      `SELECT * FROM payment WHERE loan_number = $1 AND payment_number = $2`,
      [loanNumber, payment_number]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const duePayment = paymentRes.rows[0];

    // Check if the payment is already marked as paid
    if (duePayment.payment_status === 'paid') {
      return res.status(400).json({ message: 'Payment already made' });
    }

    // Get the current date for 'payment_made'
    const currentDate = new Date().toISOString().split('T')[0]; // Format it as YYYY-MM-DD

    // Update the payment status and the payment_made date
    await db.query(
      `UPDATE payment 
       SET payment_status = 'paid', payment_made = $1 
       WHERE loan_number = $2 AND payment_number = $3`,
      [currentDate, loanNumber, payment_number] // Pass the formatted date here
    );

    // Update the balance (assuming you want to subtract the payment_amount from the balance)
    const updateBalanceRes = await db.query(
      `UPDATE account 
       SET balance = balance - $1 
       WHERE account_number = (SELECT account_number FROM depositor WHERE customer_id = (SELECT customer_id FROM borrower WHERE loan_number = $2))`,
      [payment_amount, loanNumber]
    );

    res.json({ message: 'Payment successfully recorded and balance updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// Fetch payment by customer_id
router.get('/by-customer/:customer_id', async (req, res) => {
  const customerId = req.params.customer_id;

  try {
    const loanRes = await db.query(
      'SELECT loan_number FROM borrower WHERE customer_id = $1',
      [customerId]
    );

    if (loanRes.rows.length === 0) {
      return res.status(404).json({ message: 'No loan found for this customer ID' });
    }

    const loanNumber = loanRes.rows[0].loan_number;

    const paymentRes = await db.query(
      'SELECT * FROM payment WHERE loan_number = $1 ORDER BY payment_number',
      [loanNumber]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({ message: 'No payments found for this loan' });
    }

    res.json(paymentRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payment details' });
  }
});

// Original route: GET /payment/:loan_number
router.get('/:loan_number', async (req, res) => {
  try {
    const paymentRes = await db.query(
      'SELECT * FROM payment WHERE loan_number = $1',
      [req.params.loan_number]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({ message: 'No payments found for this loan' });
    }

    res.json(paymentRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payment details' });
  }
});


module.exports = router;