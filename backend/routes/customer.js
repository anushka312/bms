const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT customer_id, customer_name, customer_street, customer_city, email FROM customer'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get specific customer
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT customer_id, customer_name, customer_street, customer_city, email FROM customer WHERE customer_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register new customer
router.post('/', async (req, res) => {
  const { customer_name, customer_street, customer_city, email, password } = req.body;

  if (!customer_name || !customer_street || !customer_city || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await db.query(
      `INSERT INTO customer (customer_name, customer_street, customer_city, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING customer_id, customer_name, email`,
      [customer_name, customer_street, customer_city, email, hashedPassword]
    );

    const newCustomer = insertResult.rows[0];

    res.status(201).json({
      message: 'Customer registered',
      user: newCustomer
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Secure Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM customer WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const customer = result.rows[0];
    const valid = await bcrypt.compare(password, customer.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //only return non-sensitive fields
    const { customer_id, customer_name } = customer;

    res.status(200).json({
      message: 'Login successful',
      user: { customer_id, customer_name, email: customer.email }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  const { customer_name, customer_street, customer_city } = req.body;

  try {
    await db.query(
      'UPDATE customer SET customer_name = $1, customer_street = $2, customer_city = $3 WHERE customer_id = $4',
      [customer_name, customer_street, customer_city, req.params.id]
    );
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM customer WHERE customer_id = $1', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
