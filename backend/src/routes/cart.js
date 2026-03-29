const express = require('express');
const router = express.Router();
const db = require('../db');

function parseImages(item) {
  try { item.images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images || []; } catch { item.images = []; }
  return item;
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.original_price,
              p.discount_percent, p.images, p.stock, p.brand
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    res.json(result.rows.map(parseImages));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cart
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const existing = await db.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.rows.length) {
      const newQty = existing.rows[0].quantity + quantity;
      await db.query('UPDATE cart SET quantity = ? WHERE id = ?', [newQty, existing.rows[0].id]);
      const updated = await db.query('SELECT * FROM cart WHERE id = ?', [existing.rows[0].id]);
      return res.json(updated.rows[0]);
    }

    const result = await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [req.user.id, product_id, quantity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cart/:id
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      return res.json({ deleted: true });
    }
    await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    const result = await db.query('SELECT * FROM cart WHERE id = ?', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart — clear all
router.delete('/', async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
