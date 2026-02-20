const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', authenticate, (req, res) => {
  try {
    const { start_date, end_date, trainer_id } = req.query;
    
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = ' AND start_date >= ? AND end_date <= ?';
      params.push(start_date, end_date);
    }

    // For trainers, only show their stats
    let trainerFilter = '';
    if (req.user.role === 'trainer') {
      trainerFilter = ' AND trainer_id = ?';
      params.push(req.user.id);
    } else if (trainer_id) {
      trainerFilter = ' AND trainer_id = ?';
      params.push(trainer_id);
    }

    // Status counts
    const statusCounts = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM trainings
      WHERE 1=1 ${dateFilter} ${trainerFilter}
      GROUP BY status
    `).all(...params);

    // Total trainings
    const totalTrainings = db.prepare(`
      SELECT COUNT(*) as count FROM trainings WHERE 1=1 ${dateFilter} ${trainerFilter}
    `).get(...params);

    // Total hours (completed trainings)
    const totalHours = db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes
      FROM trainings 
      WHERE status = 'completed' ${dateFilter} ${trainerFilter}
    `).get(...params);

    // Active trainers count (admins/managers only)
    let activeTrainers = { count: 0 };
    if (req.user.role !== 'trainer') {
      activeTrainers = db.prepare(`
        SELECT COUNT(DISTINCT trainer_id) as count
        FROM trainings
        WHERE 1=1 ${dateFilter}
      `).get(...(start_date && end_date ? [start_date, end_date] : []));
    }

    // Training by type
    const byType = db.prepare(`
      SELECT 
        type,
        COUNT(*) as count
      FROM trainings
      WHERE 1=1 ${dateFilter} ${trainerFilter}
      GROUP BY type
    `).all(...params);

    // Upcoming trainings (next 7 days)
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let upcomingParams = [today, nextWeek];
    let upcomingTrainerFilter = '';
    if (req.user.role === 'trainer') {
      upcomingTrainerFilter = ' AND trainer_id = ?';
      upcomingParams.push(req.user.id);
    }

    const upcomingTrainings = db.prepare(`
      SELECT t.*, u.name as trainer_name
      FROM trainings t
      LEFT JOIN users u ON t.trainer_id = u.id
      WHERE t.start_date >= ? AND t.start_date <= ? AND t.status = 'planned'
      ${upcomingTrainerFilter}
      ORDER BY t.start_date ASC
      LIMIT 5
    `).all(...upcomingParams);

    // Recent activity (last 5 completed)
    let recentParams = [];
    let recentTrainerFilter = '';
    if (req.user.role === 'trainer') {
      recentTrainerFilter = ' AND trainer_id = ?';
      recentParams.push(req.user.id);
    }

    const recentCompleted = db.prepare(`
      SELECT t.*, u.name as trainer_name
      FROM trainings t
      LEFT JOIN users u ON t.trainer_id = u.id
      WHERE t.status = 'completed' ${recentTrainerFilter}
      ORDER BY t.updated_at DESC
      LIMIT 5
    `).all(...recentParams);

    // Convert status counts to object
    const statusMap = {};
    statusCounts.forEach(s => {
      statusMap[s.status] = s.count;
    });

    // Convert type counts to object
    const typeMap = {};
    byType.forEach(t => {
      typeMap[t.type] = t.count;
    });

    res.json({
      stats: {
        total_trainings: totalTrainings.count,
        total_hours: Math.round((totalHours.total_minutes || 0) / 60 * 10) / 10,
        active_trainers: activeTrainers.count,
        by_status: {
          planned: statusMap.planned || 0,
          ongoing: statusMap.ongoing || 0,
          completed: statusMap.completed || 0,
          cancelled: statusMap.cancelled || 0
        },
        by_type: {
          client: typeMap.client || 0,
          internal: typeMap.internal || 0
        }
      },
      upcoming_trainings: upcomingTrainings,
      recent_completed: recentCompleted
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /api/dashboard/calendar
 * Get trainings for calendar view
 */
router.get('/calendar', authenticate, (req, res) => {
  try {
    const { start, end, trainer_id } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    let query = `
      SELECT t.*, u.name as trainer_name, u.email as trainer_email
      FROM trainings t
      LEFT JOIN users u ON t.trainer_id = u.id
      WHERE t.start_date <= ? AND t.end_date >= ?
    `;
    const params = [end, start];

    if (req.user.role === 'trainer') {
      query += ' AND t.trainer_id = ?';
      params.push(req.user.id);
    } else if (trainer_id) {
      query += ' AND t.trainer_id = ?';
      params.push(trainer_id);
    }

    query += ' ORDER BY t.start_date ASC';

    const events = db.prepare(query).all(...params);

    // Transform to calendar event format
    const calendarEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      start: e.start_date,
      end: e.end_date,
      status: e.status,
      type: e.type,
      trainer_name: e.trainer_name,
      trainer_id: e.trainer_id,
      location: e.location,
      meeting_link: e.meeting_link
    }));

    res.json({ events: calendarEvents });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

/**
 * GET /api/dashboard/trainer-stats
 * Get per-trainer statistics (manager/admin view)
 */
router.get('/trainer-stats', authenticate, (req, res) => {
  try {
    if (req.user.role === 'trainer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = ' AND t.start_date >= ? AND t.end_date <= ?';
      params.push(start_date, end_date);
    }

    const trainerStats = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(t.id) as total_trainings,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN t.status = 'planned' THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.duration_minutes ELSE 0 END), 0) as total_minutes
      FROM users u
      LEFT JOIN trainings t ON u.id = t.trainer_id ${dateFilter}
      WHERE u.role IN ('trainer', 'manager', 'head') AND u.is_active = 1
      GROUP BY u.id
      ORDER BY total_trainings DESC
    `).all(...params);

    res.json({ 
      trainer_stats: trainerStats.map(s => ({
        ...s,
        total_hours: Math.round(s.total_minutes / 60 * 10) / 10
      }))
    });
  } catch (error) {
    console.error('Trainer stats error:', error);
    res.status(500).json({ error: 'Failed to fetch trainer stats' });
  }
});

module.exports = router;
