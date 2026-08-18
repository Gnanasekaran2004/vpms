import express from 'express';
import { getDashboardStats, getChartData } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const dash = express.Router();

dash.get('/stats', protect, getDashboardStats);
dash.get('/chart', protect, getChartData);

export default dash;
