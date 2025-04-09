const express = require('express');
const router = express.Router();
const db = require('../db');

//get all branches
router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM branch');
      res.json(result.rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

//get specific branch
router.get('/:name', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM branch WHERE branch_name = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).send('Branch not found');
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
});

//add a new branch
router.post('/', async (req, res) => {
    const { branch_name, branch_city, assets } = req.body;
    try {
        await db.query(
            'INSERT INTO branch (branch_name, branch_city, assets ) VALUES ($1, $2, $3)',
            [branch_name, branch_city, assets]
        );
        res.status(201).send('Customer added');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//update a branch
router.put('/:name', async (req, res) => {
    const { branch_city, assets } = req.body;
    try {
      await db.query(
        'UPDATE branch SET branch_city = $1, assets = $2 WHERE branch_name = $3',
        [branch_city, assets, req.params.name]
      );
      res.send('Branch updated');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// delete a branch
router.delete('/:name', async (req, res) => {
    try {
      await db.query(
        'DELETE FROM branch WHERE branch_name = $1',
        [req.params.name]
      );
      res.send('Branch deleted');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

module.exports = router;