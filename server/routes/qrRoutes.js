import express from 'express';
import VisitorPass from '../models/VisitorPass.js';
import { ok, err } from '../utils/apiResponse.js';

const qrRouter = express.Router();

qrRouter.get('/:passNumber', async (req, res) => {
  try {
    const pass = await VisitorPass.findOne({ passNumber: req.params.passNumber })
      .populate('employeeToVisit', 'name department');

    if (!pass) {
      return err(res, 'Visitor pass not found.', 404);
    }

    const publicData = {
      passNumber: pass.passNumber,
      visitorName: pass.visitorName,
      personToMeet: pass.employeeToVisit?.name || 'N/A',
      department: pass.employeeToVisit?.department || 'N/A',
      visitDate: pass.visitDate,
      status: pass.status,
      checkInTime: pass.checkInTime || null,
      checkOutTime: pass.checkOutTime || null,
    };

    return ok(res, publicData, 'Pass verified.');
  } catch (e) {
    return err(res, 'Server error during QR verification.', 500);
  }
});

export default qrRouter;