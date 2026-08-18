import express from 'express';
import { getVisitorReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { exportVisitorReportCSV } from '../controllers/reportController.js';
const repRoute = express.Router();

repRoute.get('/visitors', protect, authorizeRoles('Administrator'), getVisitorReport);
repRoute.get('/export', protect, authorizeRoles('Administrator'), exportVisitorReportCSV);
export default repRoute;
