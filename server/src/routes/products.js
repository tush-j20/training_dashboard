const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/products
 * Get all products
 */
router.get('/', authenticate, (req, res) => {
  try {
    const { category, active_only } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (active_only === 'true') {
      query += ' AND is_active = 1';
    }

    query += ' ORDER BY name ASC';

    const products = db.prepare(query).all(...params);
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:id
 * Get single product with training stats
 */
router.get('/:id', authenticate, (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get training count for this product
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_trainings,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_trainings
      FROM training_products tp
      JOIN trainings t ON tp.training_id = t.id
      WHERE tp.product_id = ?
    `).get(req.params.id);

    res.json({ product: { ...product, ...stats } });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/products
 * Create new product (admin only)
 */
router.post('/', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const result = db.prepare(`
      INSERT INTO products (name, category, description)
      VALUES (?, ?, ?)
    `).run(name, category, description);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Product name already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/products/:id
 * Update product (admin only)
 */
router.put('/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, category, description, is_active } = req.body;

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, category, description, is_active, req.params.id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete product (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is used in any trainings
    const usage = db.prepare(
      'SELECT COUNT(*) as count FROM training_products WHERE product_id = ?'
    ).get(req.params.id);

    if (usage.count > 0) {
      // Soft delete instead
      db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
      return res.json({ message: 'Product deactivated (has associated trainings)' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/**
 * GET /api/products/categories/list
 * Get unique categories
 */
router.get('/categories/list', authenticate, (req, res) => {
  try {
    const categories = db.prepare(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
    ).all();
    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
