const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM depositor');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  const { customer_id, account_number } = req.body;
  try {
    await db.query('INSERT INTO depositor (customer_id, account_number) VALUES ($1, $2)', [customer_id, account_number]);
    res.status(201).send('Depositor added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;