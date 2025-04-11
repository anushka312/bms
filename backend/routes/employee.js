const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT employee_id, employee_name, telephone_number, start_date, email FROM employee'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT employee_id, employee_name, telephone_number, start_date, email FROM employee WHERE employee_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM employee WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const employee = result.rows[0];
    const valid = await bcrypt.compare(password, employee.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.json({ message: 'Employee updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM employee WHERE employee_id = $1', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
