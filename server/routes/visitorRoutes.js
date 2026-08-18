import express from 'express';
import { registerVisitor, getAllVisitors, getVisitorById, approveVisitor, rejectVisitor, checkInVisitor, checkOutVisitor, cancelVisit, getVisitorLogs, bulkApproveVisitors } from '../controllers/visitorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateVisitor, checkValidation } from '../middleware/validators.js';
const visitRtr = express.Router();

visitRtr.use(protect);
visitRtr.post('/', authorizeRoles('Receptionist'), validateVisitor, checkValidation, registerVisitor);
visitRtr.get('/', getAllVisitors);
visitRtr.get('/:id', getVisitorById);

visitRtr.patch('/bulk-approve', authorizeRoles('Employee'), bulkApproveVisitors);

visitRtr.patch('/:id/approve', authorizeRoles('Employee'), approveVisitor);
visitRtr.patch('/:id/reject', authorizeRoles('Employee'), rejectVisitor);
visitRtr.post('/:id/check-in', authorizeRoles('Receptionist'), checkInVisitor);
visitRtr.post('/:id/check-out', authorizeRoles('Receptionist'), checkOutVisitor);

visitRtr.patch('/:id/cancel', authorizeRoles('Receptionist', 'Administrator'), cancelVisit);
visitRtr.get('/:id/logs', getVisitorLogs);

export default visitRtr;
