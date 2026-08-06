import express from 'express';
import { getVisitorReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const repRoute = express.Router();

repRoute.get('/visitors', protect, authorizeRoles('Administrator'), getVisitorReport);

export default repRoute;
