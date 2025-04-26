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
  // Extracting fields from the request body
  const { customer_name, customer_street, customer_city, password } = req.body;

  // Array to hold the values to be updated dynamically
  let updateFields = [];
  let queryParams = [];
  
  // If password is provided, hash it before updating
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push('password = $' + (queryParams.length + 1)); 
    queryParams.push(hashedPassword);
  }
  
  // Add other fields to update if provided
  if (customer_name) {
    updateFields.push('customer_name = $' + (queryParams.length + 1));
    queryParams.push(customer_name);
  }

  if (customer_street) {
    updateFields.push('customer_street = $' + (queryParams.length + 1));
    queryParams.push(customer_street);
  }

  if (customer_city) {
    updateFields.push('customer_city = $' + (queryParams.length + 1));
    queryParams.push(customer_city);
  }

  // If no fields are provided to update, return a message
  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  // Constructing the query with the updated fields
  const query = `
    UPDATE customer
    SET 
      ${updateFields.join(', ')}  
    WHERE customer_id = $${queryParams.length + 1}  
  `;

  // Adding customer_id as the last parameter
  queryParams.push(req.params.id);

  try {
    await db.query(query, queryParams); // Execute the query
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Delete customer
// DELETE /customer/:id — Full Deep Delete
router.delete('/:id', async (req, res) => {
  const customerId = req.params.id;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Get all account_numbers linked to the customer
    const accRes = await client.query(
      `SELECT account_number FROM depositor WHERE customer_id = $1`,
      [customerId]
    );
    const accountNumbers = accRes.rows.map(row => row.account_number);

    // Delete from savings_account & checking_account
    // for (const accNum of accountNumbers) {
    //   await client.query(`DELETE FROM savings_account WHERE account_number = $1`, [accNum]);
    //   await client.query(`DELETE FROM checking_account WHERE account_number = $1`, [accNum]);
    // }

    // Delete from transaction_history
    for (const accNum of accountNumbers) {
      await client.query(
        `DELETE FROM transaction_history 
         WHERE sender_account = $1 OR receiver_account = $1`,
        [accNum]
      );
    }

    // Delete from account_branch
    for (const accNum of accountNumbers) {
      await client.query(`DELETE FROM account_branch WHERE account_number = $1`, [accNum]);
    }

    // Delete from depositor
    await client.query(`DELETE FROM depositor WHERE customer_id = $1`, [customerId]);

    // Delete from cust_banker
    await client.query(`DELETE FROM cust_banker WHERE customer_id = $1`, [customerId]);

    // Delete from account table
    for (const accNum of accountNumbers) {
      await client.query(`DELETE FROM account WHERE account_number = $1`, [accNum]);
    }

    // Finally delete customer
    await client.query(`DELETE FROM customer WHERE customer_id = $1`, [customerId]);

    await client.query('COMMIT');

    res.json({ message: 'Customer and all related data deleted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Deletion error:', err);
    res.status(500).json({ message: 'Failed to delete customer' });
  } finally {
    client.release();
  }
});


module.exports = router;
