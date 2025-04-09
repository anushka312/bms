const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cust_banker');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  const { customer_id, employee_id } = req.body;
  try {
    await db.query('INSERT INTO cust_banker (customer_id, employee_id) VALUES ($1, $2)', [customer_id, employee_id]);
    res.status(201).send('Customer-Banker relationship added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;