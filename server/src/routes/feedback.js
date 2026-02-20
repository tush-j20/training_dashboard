const express = require('express');
const crypto = require('crypto');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

/**
 * POST /api/feedback/generate/:trainingId
 * Generate feedback form for a training
 */
router.post('/generate/:trainingId', authenticate, (req, res) => {
  try {
    const { trainingId } = req.params;
    
    const training = db.prepare('SELECT * FROM trainings WHERE id = ?').get(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }

    // Check if form already exists
    const existingForm = db.prepare('SELECT * FROM feedback_forms WHERE training_id = ?').get(trainingId);
    if (existingForm) {
      return res.json({ 
        message: 'Feedback form already exists',
        form: existingForm,
        link: `/feedback/${existingForm.form_token}`
      });
    }

    // Generate unique token
    const formToken = crypto.randomBytes(16).toString('hex');
    
    // Set expiry to 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = db.prepare(`
      INSERT INTO feedback_forms (training_id, form_token, expires_at)
      VALUES (?, ?, ?)
    `).run(trainingId, formToken, expiresAt);

    const form = db.prepare('SELECT * FROM feedback_forms WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ 
      message: 'Feedback form generated',
      form,
      link: `/feedback/${formToken}`
    });
  } catch (error) {
    console.error('Generate feedback form error:', error);
    res.status(500).json({ error: 'Failed to generate feedback form' });
  }
});

/**
 * GET /api/feedback/form/:token
 * Get feedback form details (public - no auth required)
 */
router.get('/form/:token', (req, res) => {
  try {
    const { token } = req.params;

    const form = db.prepare(`
      SELECT ff.*, t.title as training_title, t.start_date, t.end_date, 
             u.name as trainer_name, t.type as training_type
      FROM feedback_forms ff
      JOIN trainings t ON ff.training_id = t.id
      JOIN users u ON t.trainer_id = u.id
      WHERE ff.form_token = ?
    `).get(token);

    if (!form) {
      return res.status(404).json({ error: 'Feedback form not found' });
    }

    if (!form.is_active) {
      return res.status(400).json({ error: 'Feedback form is no longer active' });
    }

    if (form.expires_at && new Date(form.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Feedback form has expired' });
    }

    // Get products for this training
    const products = db.prepare(`
      SELECT p.name FROM products p
      JOIN training_products tp ON p.id = tp.product_id
      WHERE tp.training_id = ?
    `).all(form.training_id);

    res.json({ 
      form: {
        ...form,
        products: products.map(p => p.name)
      }
    });
  } catch (error) {
    console.error('Get feedback form error:', error);
    res.status(500).json({ error: 'Failed to get feedback form' });
  }
});

/**
 * POST /api/feedback/submit/:token
 * Submit feedback response (public - no auth required)
 */
router.post('/submit/:token', (req, res) => {
  try {
    const { token } = req.params;
    const {
      respondent_name, respondent_email, overall_rating, content_quality,
      trainer_effectiveness, relevance, pace, key_takeaways,
      suggestions, would_recommend, additional_comments
    } = req.body;

    const form = db.prepare('SELECT * FROM feedback_forms WHERE form_token = ?').get(token);

    if (!form) {
      return res.status(404).json({ error: 'Feedback form not found' });
    }

    if (!form.is_active) {
      return res.status(400).json({ error: 'Feedback form is no longer active' });
    }

    if (form.expires_at && new Date(form.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Feedback form has expired' });
    }

    // Validate required fields
    if (!overall_rating) {
      return res.status(400).json({ error: 'Overall rating is required' });
    }

    const result = db.prepare(`
      INSERT INTO feedback_responses (
        form_id, respondent_name, respondent_email, overall_rating, content_quality,
        trainer_effectiveness, relevance, pace, key_takeaways,
        suggestions, would_recommend, additional_comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      form.id, respondent_name, respondent_email, overall_rating, content_quality,
      trainer_effectiveness, relevance, pace, key_takeaways,
      suggestions, would_recommend ? 1 : 0, additional_comments
    );

    // Get training details and notify trainer
    const training = db.prepare(`
      SELECT t.title, t.trainer_id FROM trainings t WHERE t.id = ?
    `).get(form.training_id);
    
    if (training) {
      createNotification(
        training.trainer_id,
        'feedback_received',
        'New Feedback Received',
        `New feedback submitted for "${training.title}" (Rating: ${overall_rating}/5)`,
        `/trainings/${form.training_id}/feedback`
      );
    }

    res.status(201).json({ 
      message: 'Thank you for your feedback!',
      response_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * GET /api/feedback/training/:trainingId
 * Get all feedback for a training (auth required)
 */
router.get('/training/:trainingId', authenticate, (req, res) => {
  try {
    const { trainingId } = req.params;

    const form = db.prepare(`
      SELECT ff.*, t.title as training_title, u.name as trainer_name
      FROM feedback_forms ff
      JOIN trainings t ON ff.training_id = t.id
      JOIN users u ON t.trainer_id = u.id
      WHERE ff.training_id = ?
    `).get(trainingId);

    if (!form) {
      return res.json({ form: null, responses: [], summary: null });
    }

    const responses = db.prepare(`
      SELECT * FROM feedback_responses WHERE form_id = ? ORDER BY submitted_at DESC
    `).all(form.id);

    // Calculate summary statistics
    let summary = null;
    if (responses.length > 0) {
      const avgRating = (field) => {
        const validResponses = responses.filter(r => r[field] != null);
        if (validResponses.length === 0) return null;
        return Math.round(validResponses.reduce((sum, r) => sum + r[field], 0) / validResponses.length * 10) / 10;
      };

      const recommendCount = responses.filter(r => r.would_recommend === 1).length;

      summary = {
        total_responses: responses.length,
        avg_overall: avgRating('overall_rating'),
        avg_content: avgRating('content_quality'),
        avg_trainer: avgRating('trainer_effectiveness'),
        avg_relevance: avgRating('relevance'),
        recommendation_rate: Math.round(recommendCount / responses.length * 100),
        pace_distribution: {
          too_slow: responses.filter(r => r.pace === 'too_slow').length,
          just_right: responses.filter(r => r.pace === 'just_right').length,
          too_fast: responses.filter(r => r.pace === 'too_fast').length
        }
      };
    }

    res.json({ form, responses, summary });
  } catch (error) {
    console.error('Get training feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

/**
 * GET /api/feedback/stats
 * Get overall feedback statistics (auth required)
 */
router.get('/stats', authenticate, (req, res) => {
  try {
    const { trainer_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        COUNT(DISTINCT ff.id) as total_forms,
        COUNT(fr.id) as total_responses,
        AVG(fr.overall_rating) as avg_overall,
        AVG(fr.content_quality) as avg_content,
        AVG(fr.trainer_effectiveness) as avg_trainer,
        AVG(fr.relevance) as avg_relevance
      FROM feedback_forms ff
      LEFT JOIN feedback_responses fr ON ff.id = fr.form_id
      JOIN trainings t ON ff.training_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'trainer') {
      query += ' AND t.trainer_id = ?';
      params.push(req.user.id);
    } else if (trainer_id) {
      query += ' AND t.trainer_id = ?';
      params.push(trainer_id);
    }

    if (start_date) {
      query += ' AND t.start_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND t.end_date <= ?';
      params.push(end_date);
    }

    const stats = db.prepare(query).get(...params);

    res.json({
      stats: {
        total_forms: stats.total_forms || 0,
        total_responses: stats.total_responses || 0,
        avg_overall: stats.avg_overall ? Math.round(stats.avg_overall * 10) / 10 : null,
        avg_content: stats.avg_content ? Math.round(stats.avg_content * 10) / 10 : null,
        avg_trainer: stats.avg_trainer ? Math.round(stats.avg_trainer * 10) / 10 : null,
        avg_relevance: stats.avg_relevance ? Math.round(stats.avg_relevance * 10) / 10 : null
      }
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ error: 'Failed to get feedback stats' });
  }
});

/**
 * DELETE /api/feedback/form/:id
 * Deactivate feedback form (auth required)
 */
router.delete('/form/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('UPDATE feedback_forms SET is_active = 0 WHERE id = ?').run(id);

    res.json({ message: 'Feedback form deactivated' });
  } catch (error) {
    console.error('Delete feedback form error:', error);
    res.status(500).json({ error: 'Failed to deactivate feedback form' });
  }
});

module.exports = router;
