import express from 'express';
import { getAllReviews, getReviewById, getAllRepos } from '../services/supabaseService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /reviews — all reviews for dashboard
router.get('/', async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.status(200).json(reviews);
  } catch (error) {
    logger.error('Failed to fetch reviews', error.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /reviews/:id — single review with agent logs
router.get('/:id', async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.status(200).json(review);
  } catch (error) {
    logger.error('Failed to fetch review', error.message);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// GET /repos — all repos
router.get('/repos/all', async (req, res) => {
  try {
    const repos = await getAllRepos();
    res.status(200).json(repos);
  } catch (error) {
    logger.error('Failed to fetch repos', error.message);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

export default router;