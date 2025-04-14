const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all loans
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Loan');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET loan by loan_number (ID)
router.get('/:loan_number', async (req, res) => {
    const { loan_number } = req.params;
    try {
        const result = await db.query('SELECT * FROM Loan WHERE loan_number = $1', [loan_number]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ADD a new loan and borrower
router.post('/', async (req, res) => {
    const { amount, customer_id } = req.body;

    // Start a transaction for atomicity (insert into Loan, Borrower)
    const client = await db.connect();
    try {
        await client.query('BEGIN'); // Start transaction

        // Insert into Loan table
        const loanResult = await client.query(
            'INSERT INTO Loan (amount) VALUES ($1) RETURNING loan_number',
            [amount]
        );
        const loan_number = loanResult.rows[0].loan_number; // Get generated loan_number;

        // Insert into Borrower table
        await client.query(
            'INSERT INTO Borrower (customer_id, loan_number) VALUES ($1, $2)',
            [customer_id, loan_number]
        );

        await client.query('COMMIT'); // Commit transaction
        res.status(201).json({ message: 'Loan executed successfully' });
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback transaction on error
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release(); // Release the client back to the pool
    }
});

// UPDATE a loan (by loan_number)
router.put('/:loan_number', async (req, res) => {
    const { loan_number } = req.params;
    const { amount } = req.body;

    try {
        const result = await db.query(
            'UPDATE Loan SET amount = $1 WHERE loan_number = $2 RETURNING *',
            [amount, loan_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.status(200).json({ message: 'Loan updated successfully', loan: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a loan (by loan_number)
router.delete('/:loan_number', async (req, res) => {
    const { loan_number } = req.params;

    try {
        // Check if loan is associated with any borrower before deleting
        const checkRelated = await db.query('SELECT * FROM Borrower WHERE loan_number = $1', [loan_number]);
        if (checkRelated.rows.length > 0) {
            return res.status(400).json({ error: 'Loan is associated with customers and cannot be deleted' });
        }

        // Delete loan from Loan_Branch table first if associated
        await db.query('DELETE FROM Loan_Branch WHERE loan_number = $1', [loan_number]);

        // Now delete loan from Loan table
        const result = await db.query('DELETE FROM Loan WHERE loan_number = $1 RETURNING *', [loan_number]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        res.status(200).json({ message: 'Loan deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
