import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.post('/login', AuthController.login);

// Routes protégées
router.get('/me', authMiddleware, AuthController.getMe);
router.post('/change-password', authMiddleware, AuthController.changePassword);

export const authRoutes = router;
