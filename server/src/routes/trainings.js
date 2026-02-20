const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/trainings
 * Get all trainings with optional filters
 */
router.get('/', authenticate, (req, res) => {
  try {
    const { status, trainer_id, type, start_date, end_date } = req.query;
    
    let query = `
      SELECT t.*, u.name as trainer_name, u.email as trainer_email,
        GROUP_CONCAT(p.name) as product_names
      FROM trainings t
      LEFT JOIN users u ON t.trainer_id = u.id
      LEFT JOIN training_products tp ON t.id = tp.training_id
      LEFT JOIN products p ON tp.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (trainer_id) {
      query += ' AND t.trainer_id = ?';
      params.push(trainer_id);
    }
    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }
    if (start_date) {
      query += ' AND t.start_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND t.end_date <= ?';
      params.push(end_date);
    }

    // Non-admin users can only see their own trainings or all trainings
    if (req.user.role === 'trainer') {
      query += ' AND t.trainer_id = ?';
      params.push(req.user.id);
    }

    query += ' GROUP BY t.id ORDER BY t.start_date DESC';

    const trainings = db.prepare(query).all(...params);
    res.json({ trainings });
  } catch (error) {
    console.error('Get trainings error:', error);
    res.status(500).json({ error: 'Failed to fetch trainings' });
  }
});

/**
 * GET /api/trainings/:id
 * Get single training by ID
 */
router.get('/:id', authenticate, (req, res) => {
  try {
    const training = db.prepare(`
      SELECT t.*, u.name as trainer_name, u.email as trainer_email
      FROM trainings t
      LEFT JOIN users u ON t.trainer_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Get associated products
    const products = db.prepare(`
      SELECT p.* FROM products p
      JOIN training_products tp ON p.id = tp.product_id
      WHERE tp.training_id = ?
    `).all(req.params.id);

    res.json({ training: { ...training, products } });
  } catch (error) {
    console.error('Get training error:', error);
    res.status(500).json({ error: 'Failed to fetch training' });
  }
});

/**
 * POST /api/trainings
 * Create new training
 */
router.post('/', authenticate, (req, res) => {
  try {
    const {
      title, description, type, trainer_id, start_date, end_date,
      duration_minutes, location, meeting_link, attendee_count, notes, product_ids
    } = req.body;

    // Validation
    if (!title || !type || !trainer_id || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Title, type, trainer, start date, and end date are required' 
      });
    }

    // Trainers can only create trainings for themselves
    const actualTrainerId = req.user.role === 'trainer' ? req.user.id : trainer_id;

    const result = db.prepare(`
      INSERT INTO trainings (title, description, type, trainer_id, start_date, end_date,
        duration_minutes, location, meeting_link, attendee_count, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, description, type, actualTrainerId, start_date, end_date,
      duration_minutes, location, meeting_link, attendee_count, notes
    );

    const trainingId = result.lastInsertRowid;

    // Add product associations
    if (product_ids && product_ids.length > 0) {
      const insertProduct = db.prepare(
        'INSERT INTO training_products (training_id, product_id) VALUES (?, ?)'
      );
      product_ids.forEach(productId => {
        insertProduct.run(trainingId, productId);
      });
    }

    const training = db.prepare('SELECT * FROM trainings WHERE id = ?').get(trainingId);
    res.status(201).json({ message: 'Training created', training });
  } catch (error) {
    console.error('Create training error:', error);
    res.status(500).json({ error: 'Failed to create training' });
  }
});

/**
 * PUT /api/trainings/:id
 * Update training
 */
router.put('/:id', authenticate, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM trainings WHERE id = ?').get(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Trainers can only update their own trainings
    if (req.user.role === 'trainer' && existing.trainer_id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot update other trainers\' trainings' });
    }

    const {
      title, description, type, trainer_id, start_date, end_date, status,
      duration_minutes, location, meeting_link, attendee_count, actual_attendee_count, notes, product_ids
    } = req.body;

    db.prepare(`
      UPDATE trainings SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        trainer_id = COALESCE(?, trainer_id),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        status = COALESCE(?, status),
        duration_minutes = COALESCE(?, duration_minutes),
        location = COALESCE(?, location),
        meeting_link = COALESCE(?, meeting_link),
        attendee_count = COALESCE(?, attendee_count),
        actual_attendee_count = COALESCE(?, actual_attendee_count),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, description, type, trainer_id, start_date, end_date, status,
      duration_minutes, location, meeting_link, attendee_count, actual_attendee_count, notes,
      req.params.id
    );

    // Update product associations if provided
    if (product_ids !== undefined) {
      db.prepare('DELETE FROM training_products WHERE training_id = ?').run(req.params.id);
      if (product_ids.length > 0) {
        const insertProduct = db.prepare(
          'INSERT INTO training_products (training_id, product_id) VALUES (?, ?)'
        );
        product_ids.forEach(productId => {
          insertProduct.run(req.params.id, productId);
        });
      }
    }

    const training = db.prepare('SELECT * FROM trainings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Training updated', training });
  } catch (error) {
    console.error('Update training error:', error);
    res.status(500).json({ error: 'Failed to update training' });
  }
});

/**
 * DELETE /api/trainings/:id
 * Delete training (admin/manager only)
 */
router.delete('/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM trainings WHERE id = ?').get(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Training not found' });
    }

    db.prepare('DELETE FROM trainings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Training deleted' });
  } catch (error) {
    console.error('Delete training error:', error);
    res.status(500).json({ error: 'Failed to delete training' });
  }
});

/**
 * PATCH /api/trainings/:id/status
 * Update training status
 */
router.patch('/:id/status', authenticate, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['planned', 'ongoing', 'completed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = db.prepare('SELECT * FROM trainings WHERE id = ?').get(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Training not found' });
    }

    if (req.user.role === 'trainer' && existing.trainer_id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot update other trainers\' trainings' });
    }

    db.prepare(`
      UPDATE trainings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, req.params.id);

    res.json({ message: 'Status updated', status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
