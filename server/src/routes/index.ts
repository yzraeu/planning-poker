import { Router } from 'express';
import { healthCheck } from './health.js';

const router = Router();

router.get('/health', healthCheck);

router.get('/rooms', (req, res) => {
  res.json({ message: 'Rooms endpoint - placeholder' });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Users endpoint - placeholder' });
});

export default router;