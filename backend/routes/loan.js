const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all loans
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM loan');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get loan by id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM loan WHERE loan_number = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Loan not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add a loan
router.post('/', async (req, res) => {
  const { loan_number, amount } = req.body;
  try {
    await db.query(
      'INSERT INTO loan (loan_number, amount) VALUES ($1, $2)',
      [loan_number, amount]
    );
    res.status(201).send('Loan added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update loan
router.put('/:id', async (req, res) => {
  const { amount } = req.body;
  try {
    await db.query(
      'UPDATE loan SET amount = $1 WHERE loan_number = $2',
      [amount, req.params.id]
    );
    res.send('Loan updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM loan WHERE loan_number = $1', [req.params.id]);
    res.send('Loan deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
