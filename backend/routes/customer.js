const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT customer_id, customer_name, customer_street, customer_city, email FROM customer');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get specific customer
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT customer_id, customer_name, customer_street, customer_city, email FROM customer WHERE customer_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Customer not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Register new customer
router.post('/', async (req, res) => {
  const { customer_id, customer_name, customer_street, customer_city, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO customer (customer_id, customer_name, customer_street, customer_city, email, password) VALUES ($1, $2, $3, $4, $5, $6)',
      [customer_id, customer_name, customer_street, customer_city, email, hashedPassword]
    );
    res.status(201).send('Customer registered');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM customer WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).send('Invalid email or password');

    const customer = result.rows[0];
    const valid = await bcrypt.compare(password, customer.password);

    if (!valid) return res.status(401).send('Invalid email or password');

    res.send('Login successful');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  const { customer_name, customer_street, customer_city } = req.body;
  try {
    await db.query(
      'UPDATE customer SET customer_name = $1, customer_street = $2, customer_city= $3 WHERE customer_id = $4',
      [customer_name, customer_street, customer_city, req.params.id]
    );
    res.send('Customer updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM customer WHERE customer_id = $1', [req.params.id]);
    res.send('Customer deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
