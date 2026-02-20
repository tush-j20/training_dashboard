const express = require('express');
const db = require('../db/database');
const { hashPassword } = require('../utils/auth');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users
 * Get all users (admin/manager only)
 */
router.get('/', authenticate, authorize('admin', 'manager', 'head'), (req, res) => {
  try {
    const { role, active_only } = req.query;
    
    let query = 'SELECT id, email, name, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (active_only === 'true') {
      query += ' AND is_active = 1';
    }

    query += ' ORDER BY name ASC';

    const users = db.prepare(query).all(...params);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/trainers
 * Get all trainers (for dropdown selection)
 */
router.get('/trainers', authenticate, (req, res) => {
  try {
    const trainers = db.prepare(`
      SELECT id, email, name, role FROM users 
      WHERE role IN ('trainer', 'manager', 'head') AND is_active = 1
      ORDER BY name ASC
    `).all();
    res.json({ trainers });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
});

/**
 * GET /api/users/:id
 * Get single user
 */
router.get('/:id', authenticate, (req, res) => {
  try {
    // Users can view themselves, admins can view anyone
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = db.prepare(
      'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = ?'
    ).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/users
 * Create new user (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required' });
    }

    const validRoles = ['admin', 'head', 'manager', 'trainer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const passwordHash = await hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run(email, passwordHash, name, role);

    const user = db.prepare(
      'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    
    // Users can update themselves, admins can update anyone
    if (req.user.role !== 'admin' && req.user.id !== targetId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
    
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { email, password, name, role, is_active } = req.body;

    // Only admin can change role and is_active
    const actualRole = req.user.role === 'admin' ? role : undefined;
    const actualIsActive = req.user.role === 'admin' ? is_active : undefined;

    let passwordHash = undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    db.prepare(`
      UPDATE users SET
        email = COALESCE(?, email),
        password_hash = COALESCE(?, password_hash),
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(email, passwordHash, name, actualRole, actualIsActive, targetId);

    const user = db.prepare(
      'SELECT id, email, name, role, is_active, created_at FROM users WHERE id = ?'
    ).get(targetId);

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const targetId = parseInt(req.params.id);

    // Cannot delete yourself
    if (req.user.id === targetId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
    
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has trainings
    const trainings = db.prepare(
      'SELECT COUNT(*) as count FROM trainings WHERE trainer_id = ?'
    ).get(targetId);

    if (trainings.count > 0) {
      // Soft delete
      db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(targetId);
      return res.json({ message: 'User deactivated (has associated trainings)' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
