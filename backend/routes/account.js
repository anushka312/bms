const express = require('express');
const router = express.Router();
const db = require('../db');

//get all accounts
router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM account');
      res.json(result.rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// get account by id
router.get('/:id', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM account WHERE account_number = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).send('Account not found');
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// add an account
router.post('/', async (req, res) => {
    const { account_number, balance } = req.body;
    try {
      await db.query(
        'INSERT INTO account (account_number, balance ) VALUES ($1, $2)',
        [account_number, balance ]
      );
      res.status(201).send('Account added');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

//update a customer
router.put('/:id', async (req, res) => {
  const { balance  } = req.body;
  try {
    await db.query(
      'UPDATE account SET balance = $2 WHERE account_number = $1',
      [account_number, req.params.id]
    );
    res.send('Account updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// delete a account
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE from account WHERE customer_id = $1', [req.params.id]
    );
    res.send('Account deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
