const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all transactions (or filtered by account)
router.get('/', async (req, res) => {
  const { account } = req.query; 
  try {
    let result;
    if (account) {
      result = await db.query(
        `SELECT * FROM transaction_history 
         WHERE sender_account = $1 OR receiver_account = $1 
         ORDER BY timestamp DESC`,
        [account]
      );
    } else {
      result = await db.query(
        'SELECT * FROM transaction_history ORDER BY timestamp DESC'
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transactions for a customer by ID
router.get('/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    // Step 1: Get all account numbers of the customer
    const accountsRes = await db.query(
      `SELECT account_number FROM depositor WHERE customer_id = $1`,
      [customerId]
    );

    const accountNumbers = accountsRes.rows.map(row => row.account_number);

    if (accountNumbers.length === 0) {
      return res.status(404).json({ message: 'No accounts found for this customer' });
    }

    // Step 2: Fetch transactions where sender or receiver is in those accounts
    const result = await db.query(
      `SELECT * FROM transaction_history
       WHERE sender_account = ANY($1) OR receiver_account = ANY($1)
       ORDER BY timestamp DESC`,
      [accountNumbers]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customer transactions' });
  }
});

// Add a new transaction
router.post('/', async (req, res) => {
  const { sender_account, receiver_account, amount } = req.body;

  if (!sender_account || !receiver_account || !amount) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Check sender balance
    const senderRes = await client.query(
      'SELECT balance FROM account WHERE account_number = $1',
      [sender_account]
    );
    if (senderRes.rows.length === 0) throw new Error('Sender not found');
    if (parseFloat(senderRes.rows[0].balance) < amount)
      throw new Error('Insufficient balance');

    // Deduct sender
    await client.query(
      'UPDATE account SET balance = balance - $1 WHERE account_number = $2',
      [amount, sender_account]
    );

    // Add to receiver
    const receiverRes = await client.query(
      'SELECT balance FROM account WHERE account_number = $1',
      [receiver_account]
    );
    if (receiverRes.rows.length === 0) throw new Error('Receiver not found');

    await client.query(
      'UPDATE account SET balance = balance + $1 WHERE account_number = $2',
      [amount, receiver_account]
    );

    // Record in transaction history
    await client.query(
      `INSERT INTO transaction_history (sender_account, receiver_account, amount)
       VALUES ($1, $2, $3)`,
      [sender_account, receiver_account, amount]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Transaction successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
