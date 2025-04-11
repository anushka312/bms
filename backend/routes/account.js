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
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM account WHERE account_number = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add an account
router.post('/', async (req, res) => {
  const { account_number, balance } = req.body;
  try {
    await db.query(
      'INSERT INTO account (account_number, balance) VALUES ($1, $2)',
      [account_number, balance]
    );
    res.status(201).json({ message: 'Account added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
