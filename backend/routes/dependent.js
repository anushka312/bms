const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dependent_name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  const { employee_id, dname } = req.body;
  try {
    await db.query('INSERT INTO dependent_name (employee_id, dname) VALUES ($1, $2)', [employee_id, dname]);
    res.status(201).send('Dependent added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
