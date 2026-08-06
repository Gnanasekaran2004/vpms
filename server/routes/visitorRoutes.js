import express from 'express';
import {
  registerVisitor,
  getAllVisitors,
  getVisitorById,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  cancelVisit,
  getVisitorLogs
} from '../controllers/visitorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const visitorRouter = express.Router();

visitorRouter.use(protect);

visitorRouter.post('/', authorizeRoles('Receptionist'), registerVisitor);
visitorRouter.get('/', getAllVisitors);
visitorRouter.get('/:id', getVisitorById);
visitorRouter.patch('/:id/approve', authorizeRoles('Employee'), approveVisitor);
visitorRouter.patch('/:id/reject', authorizeRoles('Employee'), rejectVisitor);
visitorRouter.post('/:id/check-in', authorizeRoles('Receptionist'), checkInVisitor);
visitorRouter.post('/:id/check-out', authorizeRoles('Receptionist'), checkOutVisitor);
visitorRouter.patch('/:id/cancel', authorizeRoles('Receptionist', 'Administrator'), cancelVisit);
visitorRouter.get('/:id/logs', getVisitorLogs);

export default visitorRouter;
