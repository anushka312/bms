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
  try {
    const result = await db.query(
      `SELECT a.*
       FROM account a
       JOIN depositor d ON a.account_number = d.account_number
       WHERE d.customer_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No deposit account found' });
    }

    res.json(result.rows[0]); // or res.json(result.rows) if user has multiple
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Add an account
router.post('/', async (req, res) => {
  const { balance, customer_id } = req.body;

  try {
    // 1. Create new account
    const accountResult = await db.query(
      'INSERT INTO account (balance) VALUES ($1) RETURNING account_number',
      [balance]
    );
    const accountNumber = accountResult.rows[0].account_number;

    // 2. Link to customer in depositor table
    await db.query(
      'INSERT INTO depositor (customer_id, account_number) VALUES ($1, $2)',
      [customer_id, accountNumber]
    );

    res.status(201).json({ message: 'Account created', account_number: accountNumber });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ message: 'Error creating account' });
  }
});


// Update an account
router.put('/:id', async (req, res) => {
  const { balance } = req.body;
  try {
    await db.query(
      'UPDATE account SET balance = $1 WHERE account_number = $2',
      [balance, req.params.id]
    );
    res.json({ message: 'Account updated' });
  } catch (err) {
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
