import VisitorPass from '../models/VisitorPass.js';
import ActivityLog from '../models/ActivityLog.js';
import logActivity from '../utils/activityLogger.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const registerVisitor = async (req, res) => {
  try {
    const { visitorName, visitorPhone, visitorEmail, employeeToVisit, visitDate, expectedArrivalTime, purposeOfVisit } = req.body;
    
    if (!visitorName || !visitorPhone || !visitorEmail || !employeeToVisit || !visitDate || !expectedArrivalTime || !purposeOfVisit) {
      return errorResponse(res, 'Missing required fields', 400);
    }
    
    const parsedVisitDate = new Date(visitDate);
    const dateOnlyVisit = new Date(parsedVisitDate.getFullYear(), parsedVisitDate.getMonth(), parsedVisitDate.getDate());
    
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateOnlyVisit < todayMidnight) {
      return errorResponse(res, 'Visit date cannot be in the past', 400);
    }
    
    if (dateOnlyVisit.getTime() === todayMidnight.getTime()) {
      const parsedExpectedTime = new Date(expectedArrivalTime);
      if (parsedExpectedTime < now) {
        return errorResponse(res, 'Expected arrival time cannot be in the past for today\'s visits', 400);
      }
    }
    
    const activeVisitForPhone = await VisitorPass.findOne({
      visitorPhone,
      status: { $in: ['Pending', 'Approved', 'CheckedIn'] }
    });
    
    if (activeVisitForPhone) {
      return errorResponse(res, 'Visitor already has an active visit', 400);
    }
    
    const endOfDayVisit = new Date(dateOnlyVisit);
    endOfDayVisit.setHours(23, 59, 59, 999);
    
    const existingRegistrationForDate = await VisitorPass.findOne({
      visitorPhone,
      visitDate: { $gte: dateOnlyVisit, $lte: endOfDayVisit },
      status: { $nin: ['Cancelled', 'Rejected'] }
    });
    
    if (existingRegistrationForDate) {
      return errorResponse(res, 'Visitor already registered for this date', 400);
    }
    
    const pendingRequestsForEmployee = await VisitorPass.countDocuments({
      employeeToVisit,
      status: 'Pending'
    });
    
    if (pendingRequestsForEmployee >= 3) {
      return errorResponse(res, 'Employee already has 3 pending visitor requests', 400);
    }
    
    const newVisitorPass = new VisitorPass({
      visitorName,
      visitorPhone,
      visitorEmail,
      employeeToVisit,
      visitDate: parsedVisitDate,
      expectedArrivalTime,
      purposeOfVisit,
      status: 'Pending',
      createdBy: req.user._id
    });
    
    const savedVisitorPass = await newVisitorPass.save();
    
    await logActivity({
      visitorId: savedVisitorPass._id,
      actionPerformed: 'Created',
      performedBy: req.user._id
    });
    
    const populatedPass = await VisitorPass.findById(savedVisitorPass._id)
      .populate('employeeToVisit', 'name email department')
      .populate('createdBy', 'name email');
      
    return successResponse(res, populatedPass, 'Success', 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const { visitorName, employeeId, date, status, search } = req.query;
    
    const filterQuery = {};
    
    if (!status) {
      filterQuery.status = { $ne: 'Cancelled' };
    } else {
      filterQuery.status = status;
    }
    
    if (visitorName) {
      filterQuery.visitorName = { $regex: visitorName, $options: 'i' };
    }
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);
      filterQuery.visitDate = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (search) {
      filterQuery.$or = [
        { visitorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (employeeId) {
      filterQuery.employeeToVisit = employeeId;
    }
    
    if (req.user.role === 'Employee') {
      filterQuery.employeeToVisit = req.user._id;
    }
    
    const visitorPasses = await VisitorPass.find(filterQuery)
      .populate('employeeToVisit', 'name department')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
      
    return successResponse(res, visitorPasses);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const foundVisitorPass = await VisitorPass.findById(visitorPassId)
      .populate('employeeToVisit', 'name email department')
      .populate('createdBy', 'name email');
      
    if (!foundVisitorPass) {
      return errorResponse(res, 'Visitor pass not found', 404);
    }
    
    const activityLogs = await ActivityLog.find({ visitorId: visitorPassId })
      .populate('performedBy', 'name role')
      .sort({ timestamp: 1 });
      
    return successResponse(res, { pass: foundVisitorPass, activityLogs });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const approveVisitor = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const foundVisitorPass = await VisitorPass.findById(visitorPassId);
    
    if (!foundVisitorPass) {
      return errorResponse(res, 'Visitor pass not found', 404);
    }
    
    if (foundVisitorPass.status !== 'Pending') {
      return errorResponse(res, 'Only pending requests can be approved', 400);
    }
    
    if (foundVisitorPass.employeeToVisit.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'You can only approve your own visitor requests', 403);
    }
    
    foundVisitorPass.status = 'Approved';
    if (req.body.remarks) {
      foundVisitorPass.remarks = req.body.remarks;
    }
    
    const updatedVisitorPass = await foundVisitorPass.save();
    
    await logActivity({
      visitorId: updatedVisitorPass._id,
      actionPerformed: 'Approved',
      performedBy: req.user._id,
      notes: req.body.remarks
    });
    
    return successResponse(res, updatedVisitorPass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const rejectVisitor = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const foundVisitorPass = await VisitorPass.findById(visitorPassId);
    
    if (!foundVisitorPass) {
      return errorResponse(res, 'Visitor pass not found', 404);
    }
    
    if (foundVisitorPass.status !== 'Pending') {
      return errorResponse(res, 'Only pending requests can be rejected', 400);
    }
    
    if (foundVisitorPass.employeeToVisit.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'You can only reject your own visitor requests', 403);
    }
    
    foundVisitorPass.status = 'Rejected';
    foundVisitorPass.remarks = req.body.remarks;
    
    const updatedVisitorPass = await foundVisitorPass.save();
    
    await logActivity({
      visitorId: updatedVisitorPass._id,
      actionPerformed: 'Rejected',
      performedBy: req.user._id,
      notes: req.body.remarks
    });
    
    return successResponse(res, updatedVisitorPass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const checkInVisitor = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const foundVisitorPass = await VisitorPass.findById(visitorPassId);
    
    if (!foundVisitorPass) {
      return errorResponse(res, 'Visitor pass not found', 404);
    }
    
    if (foundVisitorPass.status === 'Rejected') {
      return errorResponse(res, 'Cannot check in a rejected request', 400);
    }
    
    if (foundVisitorPass.status !== 'Approved') {
      return errorResponse(res, 'Visitor must be approved before check-in', 400);
    }
    
    if (foundVisitorPass.status === 'CheckedIn') {
      return errorResponse(res, 'Visitor is already checked in', 400);
    }
    
    foundVisitorPass.status = 'CheckedIn';
    foundVisitorPass.checkInTime = new Date();
    
    const updatedVisitorPass = await foundVisitorPass.save();
    
    await logActivity({
      visitorId: updatedVisitorPass._id,
      actionPerformed: 'Checked In',
      performedBy: req.user._id
    });
    
    return successResponse(res, updatedVisitorPass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const foundVisitorPass = await VisitorPass.findById(visitorPassId);
    
    if (!foundVisitorPass) {
      return errorResponse(res, 'Visitor pass not found', 404);
    }
    
    if (foundVisitorPass.status !== 'CheckedIn') {
      return errorResponse(res, 'Visitor must be checked in before check-out', 400);
    }
    
    const computedCheckOutTime = new Date();
    if (computedCheckOutTime <= foundVisitorPass.checkInTime) {
      return errorResponse(res, 'Check-out time must be later than check-in time', 400);
    }
    
    foundVisitorPass.status = 'CheckedOut';
    foundVisitorPass.checkOutTime = computedCheckOutTime;
    
    const updatedVisitorPass = await foundVisitorPass.save();
    
    await logActivity({
      visitorId: updatedVisitorPass._id,
      actionPerformed: 'Checked Out',
      performedBy: req.user._id
    });
    
    return successResponse(res, updatedVisitorPass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const cancelVisit = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const foundVisitorPass = await VisitorPass.findById(visitorPassId);
    
    if (!foundVisitorPass) {
      return errorResponse(res, 'Visitor pass not found', 404);
    }
    
    if (['CheckedIn', 'CheckedOut'].includes(foundVisitorPass.status)) {
      return errorResponse(res, 'Cannot cancel an active or completed visit', 400);
    }
    
    foundVisitorPass.status = 'Cancelled';
    
    const updatedVisitorPass = await foundVisitorPass.save();
    
    await logActivity({
      visitorId: updatedVisitorPass._id,
      actionPerformed: 'Cancelled',
      performedBy: req.user._id
    });
    
    return successResponse(res, updatedVisitorPass);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const getVisitorLogs = async (req, res) => {
  try {
    const visitorPassId = req.params.id;
    const activityLogs = await ActivityLog.find({ visitorId: visitorPassId })
      .populate('performedBy', 'name role')
      .sort({ timestamp: 1 });
      
    return successResponse(res, activityLogs);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};
