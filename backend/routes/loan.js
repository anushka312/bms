const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any other email service
  auth: {
    user: process.env.EMAIL_USER,  // Get the email from the .env file
    pass: process.env.EMAIL_PASS   // Get the email password from the .env file
  }
});

// Helper function to send email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Use the email from .env
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error occurred:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Helper function to generate EMI schedule
const generateEMI = (loanNumber, amount, months = 12) => {
  const emiAmount = amount / months; // Simple EMI calculation
  const startDate = new Date(); // Assuming the loan starts today

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i); // Increment due date by 1 month for each EMI

    // Insert into the payment table
    db.query(
      `INSERT INTO payment (loan_number, payment_number, payment_date, payment_amount, payment_status, payment_made, due_date)
       VALUES ($1, $2, CURRENT_DATE, $3, 'pending', 0, $4)`,
      [loanNumber, i, emiAmount, dueDate]
    );
  }
};

// POST /loan/apply
// POST /loan/apply
router.post('/apply', async (req, res) => {
  const { customer_id, amount, branch_name } = req.body;

  try {
    // 1. Fetch customer city from the customer table
    const customerRes = await db.query(
      `SELECT customer_city FROM customer WHERE customer_id = $1`,
      [customer_id]
    );

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer_city = customerRes.rows[0].customer_city;
    console.log("DEBUG: Customer city:", customer_city);

    // 2. Get branch_name from the given city
    const branchRes = await db.query(
      `SELECT branch_name FROM branch WHERE branch_city = $1`,
      [customer_city.trim()]
    );

    if (branchRes.rows.length === 0) {
      console.log("DEBUG: No branch found for city:", customer_city);
      return res.status(400).json({ message: `No branch found for city: ${customer_city}` });
    }

    // If multiple branches exist in the same city, pick randomly
    const branch_name_from_city = branchRes.rows[0].branch_name;

    console.log("DEBUG: Selected branch:", branch_name_from_city);

    // 3. Get random employee from that branch
    const bankerRes = await db.query(
      `SELECT employee_id FROM employee WHERE branch_name = $1 ORDER BY RANDOM() LIMIT 1`,
      [branch_name_from_city]
    );

    if (bankerRes.rows.length === 0) {
      return res.status(404).json({ message: 'No bankers found in this branch' });
    }

    const employee_id = bankerRes.rows[0].employee_id;

    // 4. Create loan request
    const loanRes = await db.query(
      `INSERT INTO loan (amount) VALUES ($1) RETURNING loan_number`,
      [amount]
    );
    const loan_number = loanRes.rows[0].loan_number;

    // 5. Link the loan to the branch
    await db.query(
      `INSERT INTO loan_branch (loan_number, branch_name) VALUES ($1, $2)`,
      [loan_number, branch_name_from_city]
    );

    // 6. Link customer to the loan
    await db.query(
      `INSERT INTO borrower (customer_id, loan_number, loan_start_date) VALUES ($1, $2, CURRENT_DATE)`,
      [customer_id, loan_number]
    );

    // 7. Link customer to banker
    await db.query(
      `INSERT INTO cust_banker (customer_id, employee_id) VALUES ($1, $2)`,
      [customer_id, employee_id]
    );

    res.status(201).json({
      message: 'Loan application submitted successfully!',
      loan_number,
      assigned_banker: employee_id
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message || 'Loan application failed' });
  }
});


// GET /loan/pending/:employee_id
router.get('/pending/:employee_id', async (req, res) => {
  const employeeId = req.params.employee_id;

  try {
    const result = await db.query(`
      SELECT l.loan_number, l.amount, c.customer_name, c.email, lb.branch_name
      FROM loan l
      JOIN loan_branch lb ON l.loan_number = lb.loan_number
      JOIN employee e ON e.branch_name = lb.branch_name
      JOIN borrower b ON b.loan_number = l.loan_number
      JOIN customer c ON c.customer_id = b.customer_id
      WHERE e.employee_id = $1
      AND l.loan_status = 'pending'
    `, [employeeId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching pending loans' });
  }
});

// POST /loan/:loan_number/decision
router.post('/:loan_number/decision', async (req, res) => {
  const loanNumber = req.params.loan_number;
  const { decision } = req.body; // 'approved' or 'rejected'

  try {
    const loanRes = await db.query(
      `SELECT b.customer_id, c.email, l.amount FROM borrower b
       JOIN customer c ON b.customer_id = c.customer_id
       JOIN loan l ON b.loan_number = l.loan_number
       WHERE b.loan_number = $1`,
      [loanNumber]
    );

    if (loanRes.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const { customer_id, email, amount } = loanRes.rows[0];

    if (decision === 'approved') {
      await db.query(
        `UPDATE borrower SET loan_start_date = CURRENT_DATE WHERE loan_number = $1`,
        [loanNumber]
      );

      // Generate EMI schedule after loan approval
      generateEMI(loanNumber, amount);
    }

    await db.query(
      `UPDATE loan SET loan_status = $1 WHERE loan_number = $2`,
      [decision, loanNumber]
    );

    // Send email to the customer
    const subject = `Your Loan ${decision}`;
    const text = decision === 'approved'
      ? `Congratulations! Your loan with number ${loanNumber} has been approved.`
      : `Sorry, your loan with number ${loanNumber} has been rejected.`;

    // Sending email
    sendEmail(email, subject, text);

    res.json({ message: `Loan ${decision} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing loan decision' });
  }
});
// GET /loan/status/:customer_id
router.get('/status/:customer_id', async (req, res) => {
  const customerId = req.params.customer_id;

  try {
    const result = await db.query(`
      SELECT l.loan_number, l.amount, l.status, b.loan_start_date
      FROM loan l
      JOIN borrower b ON l.loan_number = b.loan_number
      WHERE b.customer_id = $1
    `, [customerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No loans found for this customer' });
    }

    res.json(result.rows); // returns array of loans with their status
  } catch (err) {
    console.error("Error fetching loan status:", err);
    res.status(500).json({ message: 'Failed to fetch loan status' });
  }
});

// POST /payment/:loan_number
router.post('/payment/:loan_number', async (req, res) => {
  const loanNumber = req.params.loan_number;
  const { payment_number, payment_amount } = req.body;

  try {
    const paymentRes = await db.query(
      `SELECT * FROM payment WHERE loan_number = $1 AND payment_number = $2`,
      [loanNumber, payment_number]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const duePayment = paymentRes.rows[0];

    // Check if the payment is pending
    if (duePayment.payment_status === 'paid') {
      return res.status(400).json({ message: 'Payment already made' });
    }

    // Update the payment as made
    await db.query(
      `UPDATE payment SET payment_status = 'paid', payment_made = $1 WHERE loan_number = $2 AND payment_number = $3`,
      [payment_amount, loanNumber, payment_number]
    );

    res.json({ message: 'Payment successfully recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

module.exports = router;
