const express = require('express');
const router = express.Router();
const db = require('../db');

// Parse JSON fields stored as strings in SQLite
function parseProduct(p) {
  if (!p) return p;
  try { p.images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || []; } catch { p.images = []; }
  try { p.specifications = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications || {}; } catch { p.specifications = {}; }
  return p;
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = [];

    if (search) {
      params.push(`%${search}%`, `%${search}%`);
      where.push(`(p.name LIKE ? OR p.brand LIKE ?)`);
    }
    if (category) {
      params.push(category);
      where.push(`c.slug = ?`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );

    const dataParams = [...params, parseInt(limit), offset];
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      dataParams
    );

    res.json({
      products: result.rows.map(parseProduct),
      total: countResult.rows[0]?.count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(parseProduct(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
