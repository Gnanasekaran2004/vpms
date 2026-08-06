import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ok, err } from '../utils/apiResponse.js';

const actRtr = express.Router();

actRtr.get('/', protect, authorizeRoles('Administrator'), async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('performedBy', 'name role')
      .populate('visitorId', 'visitorName')
      .sort({ timestamp: -1 });
      
    return ok(res, logs);
  } catch (e) {
    return err(res, 'Server Error', 500);
  }
});

export default actRtr;
