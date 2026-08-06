import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const dash = express.Router();

dash.get('/stats', protect, getDashboardStats);

export default dash;
