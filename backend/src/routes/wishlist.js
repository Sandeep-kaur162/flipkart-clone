const express = require('express');
const router = express.Router();
const db = require('../db');

function parseImages(item) {
  try { item.images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images || []; } catch { item.images = []; }
  return item;
}

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT w.id, p.id as product_id, p.name, p.price, p.original_price,
              p.discount_percent, p.images, p.rating, p.brand, p.stock
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    res.json(result.rows.map(parseImages));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wishlist
router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    const existing = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );
    if (!existing.rows.length) {
      await db.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        [req.user.id, product_id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.productId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
