const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT employee_id, employee_name, telephone_number, start_date, email FROM employee');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT employee_id, employee_name, telephone_number, start_date, email FROM employee WHERE employee_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Employee not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Register (signup)
router.post('/', async (req, res) => {
  const { employee_id, employee_name, telephone_number, start_date, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO employee (employee_id, employee_name, telephone_number, start_date, email, password) VALUES ($1, $2, $3, $4, $5, $6)',
      [employee_id, employee_name, telephone_number, start_date, email, hashedPassword]
    );
    res.status(201).send('Employee registered');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM employee WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).send('Invalid email or password');

    const employee = result.rows[0];
    const valid = await bcrypt.compare(password, employee.password);

    if (!valid) return res.status(401).send('Invalid email or password');

    res.send('Login successful');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const { employee_name, telephone_number, start_date } = req.body;
  try {
    await db.query(
      'UPDATE employee SET employee_name = $1, telephone_number = $2, start_date = $3 WHERE employee_id = $4',
      [employee_name, telephone_number, start_date, req.params.id]
    );
    res.send('Employee updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM employee WHERE employee_id = $1', [req.params.id]);
    res.send('Employee deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
