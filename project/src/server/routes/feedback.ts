import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { validateRequest } from '../middleware/validateRequest';
import { randomUUID } from 'crypto';

const router = Router();

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  category: z.string(),
  feedback: z.string().min(1),
});

// Create feedback
router.post('/', validateRequest(feedbackSchema), (req, res) => {
  try {
    const feedbackId = randomUUID();
    const { rating, category, feedback } = req.body;

    db.prepare(`
      INSERT INTO feedback (id, rating, category, feedback, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(feedbackId, rating, category, feedback);

    const createdFeedback = db.prepare('SELECT * FROM feedback WHERE id = ?').get(feedbackId);
    res.status(201).json(createdFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Failed to create feedback' });
  }
});

// Get all feedback
router.get('/', (req, res) => {
  try {
    const feedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

export { router as feedbackRouter };