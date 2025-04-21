const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();


// GET /loan/exists/:customer_id
router.get('/exists/:customer_id', async (req, res) => {
  const customerId = req.params.customer_id;

  try {
    const result = await db.query(
      `SELECT l.status
       FROM borrower b
       JOIN loan l ON b.loan_number = l.loan_number
       WHERE b.customer_id = $1
       LIMIT 1`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.json({ hasLoan: false });
    }

    const loanStatus = result.rows[0].status;
    res.json({ hasLoan: true, status: loanStatus });
  } catch (err) {
    console.error('Error checking loan status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Get the email from the .env file
    pass: process.env.EMAIL_PASS   // Get the email password from the .env file
  }
});

// Helper function to send email
const sendEmail = (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: htmlContent
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
// Helper function to generate EMI schedule
const generateEMI = async (loanNumber, amount, months) => {
  const emiAmount = amount / months;
  const startDate = new Date();
  
  // Adjust startDate to ensure the first payment starts on the next month
  startDate.setMonth(startDate.getMonth() + 1);  // Start from the next month

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate);  // Clone the startDate to avoid modifying the same object
    dueDate.setMonth(dueDate.getMonth() + (i-1));  // Increment the month for each payment

    // Insert the payment details into the database
    await db.query(
      `INSERT INTO payment (loan_number, payment_number, payment_date, payment_amount, payment_status, payment_made, due_date)
       VALUES ($1, $2, CURRENT_DATE, $3, 'pending', $4, $5)`,
      [loanNumber, i, emiAmount, null, dueDate]
    );
  }
};


// DELETE /loan/:loan_number
router.delete('/:loan_number', async (req, res) => {
  const loanNumber = req.params.loan_number;

  try {
    // 1. Get loan details to identify the amount and customer
    const loanRes = await db.query(
      `SELECT l.amount, b.customer_id
       FROM loan l
       JOIN borrower b ON l.loan_number = b.loan_number
       WHERE l.loan_number = $1`, 
      [loanNumber]
    );

    if (loanRes.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const { amount, customer_id } = loanRes.rows[0];

    // 2. Get the account associated with the customer
    const accountRes = await db.query(
      `SELECT a.account_number
       FROM account a
       JOIN depositor d ON a.account_number = d.account_number
       WHERE d.customer_id = $1 LIMIT 1`, 
      [customer_id]
    );

    if (accountRes.rows.length === 0) {
      return res.status(404).json({ message: 'Customer has no account to deduct loan amount' });
    }

    const account_number = accountRes.rows[0].account_number;

    // 3. Deduct loan amount from the customer's account
    await db.query(
      `UPDATE account
       SET balance = balance - $1
       WHERE account_number = $2`,
      [amount, account_number]
    );

    // 4. Delete related records in the correct order to avoid foreign key issues
    await db.query(`DELETE FROM payment WHERE loan_number = $1`, [loanNumber]);
    await db.query(`DELETE FROM borrower WHERE loan_number = $1`, [loanNumber]);
    await db.query(`DELETE FROM loan_branch WHERE loan_number = $1`, [loanNumber]);

    // 5. Finally, delete the loan itself
    await db.query(`DELETE FROM loan WHERE loan_number = $1`, [loanNumber]);

    res.json({ message: `Loan ${loanNumber} and related records deleted successfully.` });
  } catch (err) {
    console.error('Error deleting loan:', err);
    res.status(500).json({ message: 'Failed to delete loan' });
  }
});



// POST /loan/apply
router.post('/apply', async (req, res) => {
  const { customer_id, amount, months } = req.body;

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

    // Since the customer city and branch name should be the same
    const branch_city_from_city = customer_city;

    console.log("DEBUG: Selected branch:", branch_city_from_city);

    // 2. Check if the customer is already linked to a banker
    const bankerRes = await db.query(
      `SELECT employee_id FROM cust_banker WHERE customer_id = $1`,
      [customer_id]
    );

    let employee_id;
    if (bankerRes.rows.length === 0) {
      return res.status(404).json({ message: 'No banker assigned to this customer' });
    } else {
      // Use the existing banker
      employee_id = bankerRes.rows[0].employee_id;
    }

    // 3. Create loan request
    const loanRes = await db.query(
      `INSERT INTO loan (amount) VALUES ($1) RETURNING loan_number`,
      [amount]
    );
    const loan_number = loanRes.rows[0].loan_number;

    // 4. Link the loan to the branch
    await db.query(
      `INSERT INTO loan_branch (loan_number, branch_city)
VALUES ($1, $2)
ON CONFLICT (loan_number, branch_city) 
DO NOTHING;
`,
      [loan_number, branch_city_from_city]
    );

    // 5. Link customer to the loan
    await db.query(
      `INSERT INTO borrower (customer_id, loan_number, loan_start_date) VALUES ($1, $2, CURRENT_DATE) ON CONFLICT (loan_number, customer_id) DO NOTHING`,
      [customer_id, loan_number]
    );

    // 6. Respond with success message and loan number
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
      JOIN employee e ON e.branch_city = lb.branch_city
      JOIN borrower b ON b.loan_number = l.loan_number
      JOIN customer c ON c.customer_id = b.customer_id
      WHERE e.employee_id = $1
      AND l.status = 'pending'
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
  const { decision, months = 12 } = req.body; // default to 12 months if not provided

  try {
    // 1. Get borrower and loan info
    const loanRes = await db.query(
      `SELECT b.customer_id, c.email, l.amount
       FROM borrower b
       JOIN customer c ON b.customer_id = c.customer_id
       JOIN loan l ON b.loan_number = l.loan_number
       WHERE b.loan_number = $1`,
      [loanNumber]
    );

    if (loanRes.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const { customer_id, email, amount } = loanRes.rows[0];

    let startDate = new Date();
    const perInstallment = (amount / months).toFixed(2);

    if (decision === 'approved') {
      // 2. Update loan start date
      await db.query(
        `UPDATE borrower SET loan_start_date = CURRENT_DATE WHERE loan_number = $1`,
        [loanNumber]
      );

      // 3. Generate EMI schedule using the helper function
      await generateEMI(loanNumber, amount, months);

      // 4. Credit amount to customer account
      const accRes = await db.query(
        `SELECT a.account_number FROM account a
         JOIN depositor d ON a.account_number = d.account_number
         WHERE d.customer_id = $1 LIMIT 1`,
        [customer_id]
      );

      if (accRes.rows.length === 0) {
        return res.status(400).json({ message: 'Customer has no account to credit loan' });
      }

      const account_number = accRes.rows[0].account_number;

      await db.query(
        `UPDATE account SET balance = balance + $1 WHERE account_number = $2`,
        [amount, account_number]
      );
    }

    // 5. Update loan status
    await db.query(
      `UPDATE loan SET status = $1 WHERE loan_number = $2`,
      [decision, loanNumber]
    );

    // 6. Send styled HTML email to customer
    let subject;
    if (decision === 'approved') {
      subject = "✅ Your Loan Request has been Approved";
    } else {
      subject = "❌ Your Loan Request has been Rejected";
    }
    let html;

    if (decision === 'approved') {
      html = `
        <div style="font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; padding: 40px; background-color: #f9f9f9;">
           <div style="max-width: 600px; width: 100%; background-color: #e9fbe9; border: 1px solid #c2e8c2; border-radius: 12px; padding: 30px; margin-bottom: 40px; text-align: center;">
    <h2 style="color: green; margin-bottom: 20px;">🎉 Congratulations!</h2>
    <p style="font-size: 16px;">Your loan (Loan No: <strong>${loanNumber}</strong>) of amount <strong>₹${amount}</strong> has been <strong>approved</strong>.</p>
    
    <h3 style="color: #333; margin-top: 30px;">Loan Details:</h3>
    <ul style="list-style: none; padding: 0; font-size: 16px; line-height: 1.6;">
      <li><strong>Number of Installments:</strong> ${months}</li>
      <li><strong>Installment Amount:</strong> ₹${perInstallment}</li>
      <li><strong>First EMI Due Date:</strong> ${startDate.toDateString()}</li>
    </ul>

    <p style="margin-top: 20px; font-size: 16px;">The approved amount has been credited to your account.</p>
    <p style="margin-top: 30px; font-size: 16px;">Thanks for banking with us!</p>
  </div>
        </div>
      `;
    } else {
      html = `
        <div style="max-width: 600px; width: 100%; background-color: #fdeaea; border: 1px solid #f3c2c2; border-radius: 12px; padding: 30px; text-align: center;">
          <h2 style="color: red; margin-bottom: 20px;">❌ Loan Rejected</h2>
    <p style="font-size: 16px;">We regret to inform you that your loan request (Loan No: <strong>${loanNumber}</strong>) has been <strong>rejected</strong>.</p>
    <p style="margin-top: 20px; font-size: 16px;">Feel free to contact your banker for further clarification.</p>
    <p style="font-size: 16px;">(Note: Your POC's details are available alongside your profile.)</p>
    <p style="margin-top: 30px; font-size: 16px;">Thank you.</p>

        </div>
      `;
    }

    // Send email to customer
    sendEmail(email, subject, html);

    // Respond with success message
    res.json({ message: `Loan ${decision} successfully.` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing loan decision' });
  }
});

// GET /loan/details/:customer_id - Customer ke loan details fetch karne ke liye
router.get('/details/:customer_id', async (req, res) => {
  const customerId = req.params.customer_id;

  try {
    const result = await db.query(
      `SELECT l.loan_number, l.amount, l.status, b.loan_start_date, lb.branch_city
       FROM loan l
       JOIN borrower b ON b.loan_number = l.loan_number
       JOIN loan_branch lb ON lb.loan_number = l.loan_number
       WHERE b.customer_id = $1`,  // Customer ID
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Unable to find the customer' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Loan details error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
