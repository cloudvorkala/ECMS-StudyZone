// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import mentorRoutes from './mentor.routes';
import notificationRoutes from './notification.routes';
import helpRoutes from './help.routes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/mentors', mentorRoutes);
router.use('/notifications', notificationRoutes);
router.use('/help', helpRoutes);

export default router;