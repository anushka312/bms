const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all dependents
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dependent_name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a dependent
router.post('/', async (req, res) => {
  const { employee_id, dname } = req.body;
  try {
    await db.query(
      'INSERT INTO dependent_name (employee_id, dname) VALUES ($1, $2)',
      [employee_id, dname]
    );
    res.status(201).json({ message: 'Dependent added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
