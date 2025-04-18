const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM account');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get account by ID
// GET /accounts/customer/:customer_id
router.get('/customer/:id', async (req, res) => {
  const customer_id = req.params.id;

  const result = await db.query(
    `SELECT a.account_number, a.balance, cb.type
     FROM account a
     JOIN depositor d ON a.account_number = d.account_number
     LEFT JOIN cust_banker cb ON cb.customer_id = d.customer_id
     WHERE d.customer_id = $1`,
    [customer_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'No account found' });
  }

  res.json(result.rows);
});



// Add an account
// POST /customer
router.post('/', async (req, res) => {
  const {
    customer_id,
    account_type    // 'savings' or 'checking'
  } = req.body;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch customer city from the customer table
    const customerRes = await client.query(
      `SELECT customer_city FROM customer WHERE customer_id = $1`, 
      [customer_id]
    );

    if (customerRes.rows.length === 0) {
      throw new Error('Customer not found');
    }

    const customer_city = customerRes.rows[0].customer_city;

    // 2. Get branch_name from the given city
    const branchRes = await client.query(
      `SELECT branch_name FROM branch WHERE branch_city = $1`, // Fetching branch for the given city
      [customer_city]
    );

    if (branchRes.rows.length === 0) {
      throw new Error('No branch found for this city');
    }

    const branch_name = branchRes.rows[0].branch_name;

    // 3. Get random employee from that branch
    const bankerRes = await client.query(
      `SELECT employee_id FROM employee WHERE branch_name = $1 ORDER BY RANDOM() LIMIT 1`, 
      [branch_name]
    );

    if (bankerRes.rows.length === 0) {
      throw new Error('No bankers found in this branch');
    }

    const employee_id = bankerRes.rows[0].employee_id;

    // 4. Create account
    const accRes = await client.query(
      `INSERT INTO account (balance) VALUES (0) RETURNING account_number`
    );
    const account_number = accRes.rows[0].account_number;

    // 5. Link account to branch
    await client.query(
      `INSERT INTO account_branch (account_number, branch_name) VALUES ($1, $2)`,
      [account_number, branch_name]
    );

    // 6. Add to depositor table
    await client.query(
      `INSERT INTO depositor (customer_id, account_number) VALUES ($1, $2)`,
      [customer_id, account_number]
    );

    // 7. Assign random banker
    await client.query(
      `INSERT INTO cust_banker (customer_id, employee_id, type) VALUES ($1, $2, $3)`,
      [customer_id, employee_id, account_type]
    );

    // 8. Add to account type table based on account type
    if (account_type === 'savings') {
      await client.query(
        `INSERT INTO savings_account (account_number, interest_rate) VALUES ($1, $2)`,
        [account_number, 3.5] // Savings account interest rate
      );
    } else if (account_type === 'checking') {
      await client.query(
        `INSERT INTO checking_account (account_number, overdraft_amount) VALUES ($1, $2)`,
        [account_number, 1000] // Checking account overdraft limit
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Account successfully created and linked',
      account_number,
      assigned_banker: employee_id,
      branch_name: branch_name // Returning the branch name with response
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating account:', err);
    res.status(500).json({ message: err.message || 'Account creation failed' });
  } finally {
    client.release();
  }
});




// Update an account
const generateTransactionId = () => {
  const timestamp = Date.now().toString();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${randomStr}`;
};

router.put('/:id', async (req, res) => {
  const { balance, amount, receiver_account } = req.body;
  const sender_account = req.params.id;

  try {
    // Update balance
    await db.query(
      'UPDATE account SET balance = $1 WHERE account_number = $2',
      [balance, sender_account]
    );

    // If amount is passed, record transaction
    if (amount && !isNaN(amount)) {
      const transactionId = generateTransactionId();
      const receiver = receiver_account || sender_account;

      await db.query(
        `INSERT INTO transaction_history 
         (transaction_id, sender_account, receiver_account, amount, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [transactionId, sender_account, receiver, amount]
      );
    }

    res.json({ message: 'Account updated and transaction recorded' });
  } catch (err) {
    console.error('Error updating account or recording transaction:', err);
    res.status(500).json({ message: err.message });
  }
});


// Delete an account
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM account WHERE account_number = $1', [req.params.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
