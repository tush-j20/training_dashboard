const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/notifications
 * Get notifications for current user
 */
router.get('/', authenticate, (req, res) => {
  try {
    const { unread_only, limit = 20 } = req.query;

    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    const params = [req.user.id];

    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const notifications = db.prepare(query).all(...params);
    
    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(req.user.id);

    res.json({ 
      notifications,
      unread_count: unreadCount.count
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticate, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`
      UPDATE notifications SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).run(id, req.user.id);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, (req, res) => {
  try {
    db.prepare(`
      UPDATE notifications SET is_read = 1 
      WHERE user_id = ?
    `).run(req.user.id);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `).run(id, req.user.id);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * Helper function to create a notification
 */
function createNotification(userId, type, title, message, link = null) {
  try {
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, type, title, message, link);
    return true;
  } catch (error) {
    console.error('Create notification error:', error);
    return false;
  }
}

/**
 * POST /api/notifications/check-reminders
 * Check and create reminders for upcoming trainings (called by cron/scheduler)
 */
router.post('/check-reminders', (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const upcomingTrainings = db.prepare(`
      SELECT t.*, u.id as trainer_user_id, u.name as trainer_name
      FROM trainings t
      JOIN users u ON t.trainer_id = u.id
      WHERE DATE(t.start_date) = ? AND t.status = 'planned'
    `).all(tomorrowStr);

    let created = 0;
    for (const training of upcomingTrainings) {
      const exists = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? AND type = 'training_reminder' 
        AND message LIKE ? AND DATE(created_at) = DATE('now')
      `).get(training.trainer_user_id, `%${training.id}%`);

      if (!exists) {
        createNotification(
          training.trainer_user_id,
          'training_reminder',
          'Training Tomorrow',
          `Reminder: "${training.title}" is scheduled for tomorrow.`,
          `/trainings/${training.id}`
        );
        created++;
      }
    }

    res.json({ message: `Created ${created} reminders` });
  } catch (error) {
    console.error('Check reminders error:', error);
    res.status(500).json({ error: 'Failed to check reminders' });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
