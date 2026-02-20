const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/reports/summary
 * Get comprehensive training summary report
 */
router.get('/summary', authenticate, (req, res) => {
  try {
    const { start_date, end_date, trainer_id } = req.query;
    
    let dateFilter = '';
    let trainerFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = ' AND t.start_date >= ? AND t.end_date <= ?';
      params.push(start_date, end_date);
    }

    if (req.user.role === 'trainer') {
      trainerFilter = ' AND t.trainer_id = ?';
      params.push(req.user.id);
    } else if (trainer_id) {
      trainerFilter = ' AND t.trainer_id = ?';
      params.push(trainer_id);
    }

    // Training counts by status
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM trainings t
      WHERE 1=1 ${dateFilter} ${trainerFilter}
      GROUP BY status
    `).all(...params);

    // Training counts by type
    const typeCounts = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM trainings t
      WHERE 1=1 ${dateFilter} ${trainerFilter}
      GROUP BY type
    `).all(...params);

    // Total hours delivered
    const hoursData = db.prepare(`
      SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COUNT(*) as completed_count
      FROM trainings t
      WHERE t.status = 'completed' ${dateFilter} ${trainerFilter}
    `).get(...params);

    // Trainings by month
    const monthlyData = db.prepare(`
      SELECT 
        strftime('%Y-%m', t.start_date) as month,
        COUNT(*) as count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM trainings t
      WHERE 1=1 ${dateFilter} ${trainerFilter}
      GROUP BY strftime('%Y-%m', t.start_date)
      ORDER BY month
    `).all(...params);

    // Top products by training count
    const topProducts = db.prepare(`
      SELECT p.name, COUNT(tp.training_id) as training_count
      FROM products p
      JOIN training_products tp ON p.id = tp.product_id
      JOIN trainings t ON tp.training_id = t.id
      WHERE 1=1 ${dateFilter} ${trainerFilter}
      GROUP BY p.id
      ORDER BY training_count DESC
      LIMIT 10
    `).all(...params);

    // Average feedback scores
    let feedbackParams = [...params];
    const feedbackStats = db.prepare(`
      SELECT 
        AVG(fr.overall_rating) as avg_overall,
        AVG(fr.content_quality) as avg_content,
        AVG(fr.trainer_effectiveness) as avg_trainer,
        COUNT(fr.id) as total_responses
      FROM feedback_responses fr
      JOIN feedback_forms ff ON fr.form_id = ff.id
      JOIN trainings t ON ff.training_id = t.id
      WHERE 1=1 ${dateFilter} ${trainerFilter}
    `).get(...feedbackParams);

    res.json({
      report: {
        by_status: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s.count }), {}),
        by_type: typeCounts.reduce((acc, t) => ({ ...acc, [t.type]: t.count }), {}),
        total_hours: Math.round((hoursData.total_minutes || 0) / 60 * 10) / 10,
        completed_trainings: hoursData.completed_count,
        monthly_trend: monthlyData,
        top_products: topProducts,
        feedback: {
          total_responses: feedbackStats.total_responses || 0,
          avg_overall: feedbackStats.avg_overall ? Math.round(feedbackStats.avg_overall * 10) / 10 : null,
          avg_content: feedbackStats.avg_content ? Math.round(feedbackStats.avg_content * 10) / 10 : null,
          avg_trainer: feedbackStats.avg_trainer ? Math.round(feedbackStats.avg_trainer * 10) / 10 : null
        }
      }
    });
  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * GET /api/reports/trainers
 * Get trainer performance report
 */
router.get('/trainers', authenticate, authorize('admin', 'manager', 'head'), (req, res) => {
  try {
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
        SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.duration_minutes ELSE 0 END), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.actual_attendee_count ELSE t.attendee_count END), 0) as total_attendees
      FROM users u
      LEFT JOIN trainings t ON u.id = t.trainer_id ${dateFilter}
      WHERE u.role IN ('trainer', 'manager', 'head') AND u.is_active = 1
      GROUP BY u.id
      ORDER BY completed DESC
    `).all(...params);

    // Get feedback scores per trainer
    const feedbackByTrainer = db.prepare(`
      SELECT 
        t.trainer_id,
        AVG(fr.overall_rating) as avg_rating,
        COUNT(fr.id) as response_count
      FROM feedback_responses fr
      JOIN feedback_forms ff ON fr.form_id = ff.id
      JOIN trainings t ON ff.training_id = t.id
      WHERE 1=1 ${dateFilter}
      GROUP BY t.trainer_id
    `).all(...params);

    const feedbackMap = feedbackByTrainer.reduce((acc, f) => ({
      ...acc,
      [f.trainer_id]: { avg_rating: Math.round(f.avg_rating * 10) / 10, response_count: f.response_count }
    }), {});

    res.json({
      trainers: trainerStats.map(t => ({
        ...t,
        total_hours: Math.round(t.total_minutes / 60 * 10) / 10,
        feedback: feedbackMap[t.id] || null
      }))
    });
  } catch (error) {
    console.error('Trainers report error:', error);
    res.status(500).json({ error: 'Failed to generate trainer report' });
  }
});

/**
 * GET /api/reports/products
 * Get product/topic training report
 */
router.get('/products', authenticate, (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = ' AND t.start_date >= ? AND t.end_date <= ?';
      params.push(start_date, end_date);
    }

    const productStats = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.category,
        COUNT(tp.training_id) as training_count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM products p
      LEFT JOIN training_products tp ON p.id = tp.product_id
      LEFT JOIN trainings t ON tp.training_id = t.id ${dateFilter.replace('AND', 'AND (1=1')}${dateFilter ? ')' : ''}
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY training_count DESC
    `).all(...params);

    res.json({ products: productStats });
  } catch (error) {
    console.error('Products report error:', error);
    res.status(500).json({ error: 'Failed to generate product report' });
  }
});

/**
 * GET /api/reports/export
 * Export training data as CSV
 */
router.get('/export', authenticate, (req, res) => {
  try {
    const { start_date, end_date, format } = req.query;
    
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = ' WHERE t.start_date >= ? AND t.end_date <= ?';
      params.push(start_date, end_date);
    }

    const trainings = db.prepare(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.type,
        t.status,
        t.start_date,
        t.end_date,
        t.duration_minutes,
        t.location,
        t.attendee_count,
        t.actual_attendee_count,
        u.name as trainer_name,
        GROUP_CONCAT(p.name) as products
      FROM trainings t
      JOIN users u ON t.trainer_id = u.id
      LEFT JOIN training_products tp ON t.id = tp.training_id
      LEFT JOIN products p ON tp.product_id = p.id
      ${dateFilter}
      GROUP BY t.id
      ORDER BY t.start_date DESC
    `).all(...params);

    if (format === 'csv') {
      const headers = ['ID', 'Title', 'Type', 'Status', 'Start Date', 'End Date', 'Duration (min)', 'Trainer', 'Location', 'Attendees', 'Products'];
      const rows = trainings.map(t => [
        t.id,
        `"${t.title}"`,
        t.type,
        t.status,
        t.start_date,
        t.end_date,
        t.duration_minutes || '',
        `"${t.trainer_name}"`,
        `"${t.location || ''}"`,
        t.actual_attendee_count || t.attendee_count || '',
        `"${t.products || ''}"`
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=trainings-export.csv');
      return res.send(csv);
    }

    res.json({ trainings });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
