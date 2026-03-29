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
    const { search, category, page = 1, limit = 20, sort = 'newest', min_price, max_price } = req.query;
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
    if (min_price) { params.push(parseFloat(min_price)); where.push(`p.price >= ?`); }
    if (max_price) { params.push(parseFloat(max_price)); where.push(`p.price <= ?`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const ORDER_MAP = {
      newest:     'p.id DESC',
      price_asc:  'p.price ASC',
      price_desc: 'p.price DESC',
      rating:     'p.rating DESC',
      discount:   'p.discount_percent DESC',
    };
    const orderBy = ORDER_MAP[sort] || 'p.id DESC';

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
       ORDER BY ${orderBy}
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

// GET /api/products/:id/related
router.get('/:id/related', async (req, res) => {
  try {
    const product = await db.query('SELECT category_id FROM products WHERE id = ?', [req.params.id]);
    if (!product.rows.length) return res.json([]);
    const { category_id } = product.rows[0];
    const result = await db.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ?
       ORDER BY p.rating DESC LIMIT 6`,
      [category_id, req.params.id]
    );
    res.json(result.rows.map(parseProduct));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
