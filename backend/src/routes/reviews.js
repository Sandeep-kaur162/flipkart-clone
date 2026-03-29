const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.name as user_name FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );

    const stats = await db.query(
      `SELECT
         COUNT(*) as total,
         ROUND(AVG(rating), 1) as avg_rating,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as r5,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as r4,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as r3,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as r2,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as r1
       FROM reviews WHERE product_id = ?`,
      [req.params.productId]
    );

    res.json({ reviews: result.rows, stats: stats.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reviews/:productId
router.post('/:productId', async (req, res) => {
  try {
    const { rating, title, body, user_name } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    // Check if user already reviewed this product
    const existing = await db.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [req.params.productId, req.user.id]
    );
    if (existing.rows.length)
      return res.status(409).json({ error: 'You have already reviewed this product' });

    const result = await db.query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, title, body)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.productId, req.user.id, user_name || 'Anonymous', rating, title || '', body || '']
    );

    // Update product avg rating
    await db.query(
      `UPDATE products SET
         rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ?),
         rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
       WHERE id = ?`,
      [req.params.productId, req.params.productId, req.params.productId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reviews/:reviewId — edit own review
router.put('/:reviewId', async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    if (rating && (rating < 1 || rating > 5))
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const existing = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.reviewId]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Review not found' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'Not your review' });

    await db.query(
      `UPDATE reviews SET rating = ?, title = ?, body = ? WHERE id = ?`,
      [rating ?? existing.rows[0].rating, title ?? existing.rows[0].title, body ?? existing.rows[0].body, req.params.reviewId]
    );

    const productId = existing.rows[0].product_id;
    await db.query(
      `UPDATE products SET
         rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ?),
         rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
       WHERE id = ?`,
      [productId, productId, productId]
    );

    const updated = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.reviewId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reviews/:reviewId — delete own review
router.delete('/:reviewId', async (req, res) => {
  try {
    const existing = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.reviewId]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Review not found' });
    if (existing.rows[0].user_id !== req.user.id)
      return res.status(403).json({ error: 'Not your review' });

    const productId = existing.rows[0].product_id;
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.reviewId]);

    await db.query(
      `UPDATE products SET
         rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ?), 0),
         rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
       WHERE id = ?`,
      [productId, productId, productId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
