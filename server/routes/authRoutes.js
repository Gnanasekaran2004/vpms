import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRoutes = express.Router();

authRoutes.post('/login', login);
authRoutes.get('/me', protect, getMe);

export default authRoutes;
