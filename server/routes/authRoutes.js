import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);

export default authRouter;
