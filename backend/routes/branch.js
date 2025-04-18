const express = require('express');
const router = express.Router();
const db = require('../db'); // PostgreSQL connection

// 1. Get all branches
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM branch');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ message: 'Error fetching branches' });
  }
});

// get cities of branch
router.get('/cities', async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT branch_city FROM branch');
    const cities = result.rows.map(row => row.branch_city);
    res.json(cities);
  } catch (err) {
    console.error('Error fetching branch cities:', err);
    res.status(500).json({ message: 'Error fetching branch cities' });
  }
});

// 2. Get single branch by name
router.get('/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await db.query('SELECT * FROM branch WHERE branch_name = $1', [name]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching branch:', err);
    res.status(500).json({ message: 'Error fetching branch' });
  }
});

// 3. Create new branch
router.post('/', async (req, res) => {
  const { branch_name, branch_city, assets } = req.body;
  try {
    await db.query(
      'INSERT INTO branch (branch_name, branch_city, assets) VALUES ($1, $2, $3)',
      [branch_name, branch_city, assets]
    );
    res.status(201).json({ message: 'Branch created successfully' });
  } catch (err) {
    console.error('Error creating branch:', err);
    res.status(500).json({ message: 'Error creating branch' });
  }
});

// 4. Update existing branch
router.put('/:name', async (req, res) => {
  const { name } = req.params;
  const { branch_city, assets } = req.body;
  try {
    const result = await db.query(
      'UPDATE branch SET branch_city = $1, assets = $2 WHERE branch_name = $3',
      [branch_city, assets, name]
    );
    res.status(200).json({ message: 'Branch updated successfully' });
  } catch (err) {
    console.error('Error updating branch:', err);
    res.status(500).json({ message: 'Error updating branch' });
  }
});

// 5. Delete a branch
router.delete('/:name', async (req, res) => {
  const { name } = req.params;
  try {
    await db.query('DELETE FROM branch WHERE branch_name = $1', [name]);
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (err) {
    console.error('Error deleting branch:', err);
    res.status(500).json({ message: 'Error deleting branch' });
  }
});

module.exports = router;
