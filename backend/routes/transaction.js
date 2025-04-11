const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all transactions (or filtered by account if query param passed)
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

// Add a new transaction (includes fund transfer logic)
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
