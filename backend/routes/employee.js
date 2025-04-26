const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT employee_id, employee_name, telephone_number, start_date, email FROM employee'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assigned employee info for a customer
router.get('/customer/:customer_id', async (req, res) => {
  const { customer_id } = req.params;

  try {
    const result = await db.query(
      `SELECT e.employee_name, e.telephone_number, e.email 
       FROM cust_banker cb
       JOIN employee e ON cb.employee_id = e.employee_id
       WHERE cb.customer_id = $1
       LIMIT 1`,
      [customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No assigned employee found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching employee info:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get employee by ID


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM employee WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const employee = result.rows[0];
    const valid = await bcrypt.compare(password, employee.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    delete employee.password;

    res.json({ message: 'Login successful', employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const { employee_name, telephone_number, start_date } = req.body;
  try {
    await db.query(
      'UPDATE employee SET employee_name = $1, telephone_number = $2, start_date = $3 WHERE employee_id = $4',
      [employee_name, telephone_number, start_date, req.params.id]
    );
    res.json({ message: 'Employee updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM employee WHERE employee_id = $1', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Insert a new employee (with hashed password)
router.post('/', async (req, res) => {
  const { employee_name, telephone_number, start_date, email, password, branch_name } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new employee with the hashed password
    const result = await db.query(
      `INSERT INTO employee (employee_name, telephone_number, start_date, email, password, branch_name) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING employee_id`,
      [employee_name, telephone_number, start_date, email, hashedPassword, branch_name]
    );

    const employee_id = result.rows[0].employee_id; // Get the employee ID of the newly created employee

    res.status(201).json({
      message: 'Employee successfully created',
      employee_id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user_details/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    // Get customer basic info
    const customerRes = await db.query(
      `SELECT customer_id, customer_name, email
       FROM customer
       WHERE customer_id = $1`,
      [customerId]
    );

    if (customerRes.rowCount === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = customerRes.rows[0];

    // Check for loan
    const loanRes = await db.query(
      `SELECT b.loan_number, l.amount, l.status, l.total_payments, b.loan_start_date
       FROM borrower b
       JOIN loan l ON l.loan_number = b.loan_number
       WHERE b.customer_id = $1`,
      [customerId]
    );

    // Get payment info if loan exists
    let payments = [];
    if (loanRes.rowCount > 0) {
      const loanNumber = loanRes.rows[0].loan_number;
      const paymentRes = await db.query(
        `SELECT payment_number, payment_amount, payment_status, payment_made, due_date
         FROM payment
         WHERE loan_number = $1`,
        [loanNumber]
      );
      payments = paymentRes.rows;
    }

    // Check for account
    const accountRes = await db.query(
      `SELECT a.account_number, a.balance
       FROM depositor d
       JOIN account a ON a.account_number = d.account_number
       WHERE d.customer_id = $1`,
      [customerId]
    );

    // Get transactions if account exists
    let transactions = [];
    if (accountRes.rowCount > 0) {
      const accountNumber = accountRes.rows[0].account_number;
      const transRes = await db.query(
        `SELECT transaction_id, sender_account, receiver_account, amount, timestamp
         FROM transaction_history
         WHERE sender_account = $1 OR receiver_account = $1`,
        [accountNumber]
      );
      transactions = transRes.rows;
    }

    res.json({
      customer,
      loan: loanRes.rows[0] || null,
      payments,
      account: accountRes.rows[0] || null,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT employee_id, employee_name, telephone_number, start_date, email, branch_name FROM employee WHERE employee_id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
