import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const activityRouter = express.Router();

activityRouter.get('/', protect, authorizeRoles('Administrator'), async (req, res) => {
  try {
    const activityLogsData = await ActivityLog.find({})
      .populate('performedBy', 'name role')
      .populate('visitorId', 'visitorName')
      .sort({ timestamp: -1 });
      
    return successResponse(res, activityLogsData);
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
});

export default activityRouter;
