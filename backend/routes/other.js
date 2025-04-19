const express = require('express');
const router = express.Router();
const db = require('../db');

// All accounts for a customer
router.get('/customer/:id/accounts', async (req, res) => {
  const result = await db.query(
    `SELECT a.* FROM account a
     JOIN depositor d ON a.account_number = d.account_number
     WHERE d.customer_id = $1`,
    [req.params.id]
  );
  res.json(result.rows); // <-- array
});



// All loans for a customer
router.get('/customer/:id/loans', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         l.loan_number,
         l.amount,
         lb.branch_name
       FROM loan l
       JOIN borrower b ON l.loan_number = b.loan_number
       JOIN loan_branch lb ON l.loan_number = lb.loan_number
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

//total accounts under an employee
router.get('/:id/accounts', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(DISTINCT d.account_number) AS totalAccounts
      FROM cust_banker cb
        JOIN depositor d ON cb.customer_id = d.customer_id
        WHERE cb.employee_id = $1; 
    `,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//total loans under an employee
router.get('/:id/loans', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(DISTINCT b.loan_number) AS totalLoans
      FROM cust_banker cb
        JOIN borrower b ON cb.customer_id = b.customer_id
        WHERE cb.employee_id = $1; 
    `,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//total pending loans
router.get('/:id/ploans', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(DISTINCT b.loan_number) AS pendingLoans
      FROM cust_banker cb
      JOIN borrower b ON cb.customer_id = b.customer_id
      JOIN loan l ON b.loan_number = l.loan_number
      WHERE cb.employee_id = $1
      AND l.status = 'pending';

    `,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// users name under employees created in the branch
router.get('/users_name/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT customer_name, c.customer_id, email
       FROM customer c
       join cust_banker cb on cb.customer_id = c.customer_id
       where employee_id = $1
      
    `,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/loan_details/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
                  c.customer_name, 
                    c.customer_id, 
                    c.email, 
                    l.status, 
                  b.loan_start_date
          FROM 
              customer c
          JOIN 
              cust_banker cb ON cb.customer_id = c.customer_id
          JOIN 
              borrower b ON b.customer_id = c.customer_id
          JOIN 
              loan l ON l.loan_number = b.loan_number
          WHERE 
              cb.employee_id = $1;

                
              `,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
