import VisitorPass from '../models/VisitorPass.js';
import ActivityLog from '../models/ActivityLog.js';
import logActivity from '../utils/activityLogger.js';
import { ok, err } from '../utils/apiResponse.js';

const valErr = (res, e) => {
  if (e.name === 'ValidationError') {
    const msgs = Object.values(e.errors).map(v => v.message);
    return err(res, msgs.join('. '), 400);
  }
  return err(res, 'Server Error', 500);
};

export const registerVisitor = async (req, res) => {
  try {
    const { visitorName, visitorPhone, visitorEmail, employeeToVisit, visitDate, expectedArrivalTime, purposeOfVisit } = req.body;

    if (!visitorName || !visitorPhone || !visitorEmail || !employeeToVisit || !visitDate || !expectedArrivalTime || !purposeOfVisit)
      return err(res, 'Missing required fields', 400);

    const visitDt = new Date(visitDate);
    const visitDay = new Date(visitDt.getFullYear(), visitDt.getMonth(), visitDt.getDate());

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (visitDay < today) return err(res, 'Visit date cannot be in the past', 400);

    if (visitDay.getTime() === today.getTime()) {
      const arrivalDt = new Date(expectedArrivalTime);
      if (arrivalDt < now) return err(res, "Expected arrival time cannot be in the past for today's visits", 400);
    }

    const activePass = await VisitorPass.findOne({
      visitorPhone,
      status: { $in: ['Pending', 'Approved', 'CheckedIn'] }
    });

    if (activePass) return err(res, 'Visitor already has an active visit', 400);

    const dayEnd = new Date(visitDay);
    dayEnd.setHours(23, 59, 59, 999);

    const dupeOnDay = await VisitorPass.findOne({
      visitorPhone,
      visitDate: { $gte: visitDay, $lte: dayEnd },
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (dupeOnDay) return err(res, 'Visitor already registered for this date', 400);

    const pendingCount = await VisitorPass.countDocuments({ employeeToVisit, status: 'Pending' });

    if (pendingCount >= 3) return err(res, 'Employee already has 3 pending visitor requests', 400);

    const created = await new VisitorPass({
      visitorName, visitorPhone, visitorEmail, employeeToVisit,
      visitDate: visitDt, expectedArrivalTime, purposeOfVisit,
      status: 'Pending', createdBy: req.user._id
    }).save();

    await logActivity({ visitorId: created._id, actionPerformed: 'Created', performedBy: req.user._id });

    const full = await VisitorPass.findById(created._id)
      .populate('employeeToVisit', 'name email department')
      .populate('createdBy', 'name email');

    return ok(res, full, 'Success', 201);
  } catch (e) {
    return valErr(res, e);
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const { visitorName, employeeId, date, status, search } = req.query;
    const q = {};

    q.status = status ? status : { $ne: 'Cancelled' };

    if (visitorName) q.visitorName = { $regex: visitorName, $options: 'i' };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);
      q.visitDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) q.$or = [{ visitorName: { $regex: search, $options: 'i' } }];
    if (employeeId) q.employeeToVisit = employeeId;
    if (req.user.role === 'Employee') q.employeeToVisit = req.user._id;

    const passes = await VisitorPass.find(q)
      .populate('employeeToVisit', 'name department')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return ok(res, passes);
  } catch (e) {
    return valErr(res, e);
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const passId = req.params.id;
    const pass = await VisitorPass.findById(passId)
      .populate('employeeToVisit', 'name email department')
      .populate('createdBy', 'name email');

    if (!pass) return err(res, 'Visitor pass not found', 404);

    const logs = await ActivityLog.find({ visitorId: passId })
      .populate('performedBy', 'name role')
      .sort({ timestamp: 1 });

    return ok(res, { pass, activityLogs: logs });
  } catch (e) {
    return valErr(res, e);
  }
};

export const approveVisitor = async (req, res) => {
  try {
    const passId = req.params.id;
    const pass = await VisitorPass.findById(passId);

    if (!pass) return err(res, 'Visitor pass not found', 404);
    if (pass.status !== 'Pending') return err(res, 'Only pending requests can be approved', 400);
    if (pass.employeeToVisit.toString() !== req.user._id.toString())
      return err(res, 'You can only approve your own visitor requests', 403);

    pass.status = 'Approved';
    if (req.body.remarks) pass.remarks = req.body.remarks;

    const saved = await pass.save();
    await logActivity({ visitorId: saved._id, actionPerformed: 'Approved', performedBy: req.user._id, notes: req.body.remarks });

    return ok(res, saved);
  } catch (e) {
    return valErr(res, e);
  }
};

export const rejectVisitor = async (req, res) => {
  try {
    const passId = req.params.id;
    const pass = await VisitorPass.findById(passId);

    if (!pass) return err(res, 'Visitor pass not found', 404);
    if (pass.status !== 'Pending') return err(res, 'Only pending requests can be rejected', 400);
    if (pass.employeeToVisit.toString() !== req.user._id.toString())
      return err(res, 'You can only reject your own visitor requests', 403);

    pass.status = 'Rejected';
    pass.remarks = req.body.remarks;

    const saved = await pass.save();
    await logActivity({ visitorId: saved._id, actionPerformed: 'Rejected', performedBy: req.user._id, notes: req.body.remarks });

    return ok(res, saved);
  } catch (e) {
    return valErr(res, e);
  }
};

export const checkInVisitor = async (req, res) => {
  try {
    const passId = req.params.id;
    const pass = await VisitorPass.findById(passId);

    if (!pass) return err(res, 'Visitor pass not found', 404);
    if (pass.status === 'Rejected') return err(res, 'Cannot check in a rejected request', 400);
    if (pass.status !== 'Approved') return err(res, 'Visitor must be approved before check-in', 400);
    if (pass.status === 'CheckedIn') return err(res, 'Visitor is already checked in', 400);

    pass.status = 'CheckedIn';
    pass.checkInTime = new Date();

    const saved = await pass.save();
    await logActivity({ visitorId: saved._id, actionPerformed: 'Checked In', performedBy: req.user._id });

    return ok(res, saved);
  } catch (e) {
    return valErr(res, e);
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const passId = req.params.id;
    const pass = await VisitorPass.findById(passId);

    if (!pass) return err(res, 'Visitor pass not found', 404);
    if (pass.status !== 'CheckedIn') return err(res, 'Visitor must be checked in before check-out', 400);

    const now = new Date();
    if (now <= pass.checkInTime) return err(res, 'Check-out time must be later than check-in time', 400);

    pass.status = 'CheckedOut';
    pass.checkOutTime = now;

    const saved = await pass.save();
    await logActivity({ visitorId: saved._id, actionPerformed: 'Checked Out', performedBy: req.user._id });

    return ok(res, saved);
  } catch (e) {
    return valErr(res, e);
  }
};

export const cancelVisit = async (req, res) => {
  try {
    const passId = req.params.id;
    const pass = await VisitorPass.findById(passId);

    if (!pass) return err(res, 'Visitor pass not found', 404);
    if (['CheckedIn', 'CheckedOut'].includes(pass.status))
      return err(res, 'Cannot cancel an active or completed visit', 400);

    pass.status = 'Cancelled';

    const saved = await pass.save();
    await logActivity({ visitorId: saved._id, actionPerformed: 'Cancelled', performedBy: req.user._id });

    return ok(res, saved);
  } catch (e) {
    return valErr(res, e);
  }
};

export const getVisitorLogs = async (req, res) => {
  try {
    const passId = req.params.id;
    const logs = await ActivityLog.find({ visitorId: passId })
      .populate('performedBy', 'name role')
      .sort({ timestamp: 1 });

    return ok(res, logs);
  } catch (e) {
    return valErr(res, e);
  }
};
