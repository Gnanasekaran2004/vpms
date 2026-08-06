import VisitorPass from '../models/VisitorPass.js';
import ActivityLog from '../models/ActivityLog.js';
import logActivity from '../utils/activityLogger.js';
import { ok, err } from '../utils/apiResponse.js';

const handleErrorValidation = (res, theError) => {
  if (theError.name === 'ValidationError') {
    const errorStrings = Object.values(theError.errors).map(singleError => singleError.message);
    const joinedErrors = errorStrings.join('. ');
    return err(res, joinedErrors, 400);
  }
  return err(res, 'Server Error', 500);
};

export const registerVisitor = async (req, res) => {
  try {
    const visitorNameInput = req.body.visitorName;
    const visitorPhoneInput = req.body.visitorPhone;
    const visitorEmailInput = req.body.visitorEmail;
    const employeeToVisitInput = req.body.employeeToVisit;
    const visitDateInput = req.body.visitDate;
    const expectedArrivalTimeInput = req.body.expectedArrivalTime;
    const purposeOfVisitInput = req.body.purposeOfVisit;

    if (!visitorNameInput || !visitorPhoneInput || !visitorEmailInput || !employeeToVisitInput || !visitDateInput || !expectedArrivalTimeInput || !purposeOfVisitInput) {
      return err(res, 'Missing required fields', 400);
    }

    const visitDateObject = new Date(visitDateInput);
    const visitDayOnly = new Date(visitDateObject.getFullYear(), visitDateObject.getMonth(), visitDateObject.getDate());

    const currentTime = new Date();
    const todayDayOnly = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

    if (visitDayOnly < todayDayOnly) {
      return err(res, 'Visit date cannot be in the past', 400);
    }

    if (visitDayOnly.getTime() === todayDayOnly.getTime()) {
      const arrivalTimeObject = new Date(expectedArrivalTimeInput);
      if (arrivalTimeObject < currentTime) {
        return err(res, 'Expected arrival time cannot be in the past for today\'s visits', 400);
      }
    }

    const currentActiveVisitorPass = await VisitorPass.findOne({
      visitorPhone: visitorPhoneInput,
      status: { $in: ['Pending', 'Approved', 'CheckedIn'] }
    });

    if (currentActiveVisitorPass) {
      return err(res, 'Visitor already has an active visit', 400);
    }

    const endOfVisitDay = new Date(visitDayOnly);
    endOfVisitDay.setHours(23, 59, 59, 999);

    const duplicatePassOnSameDay = await VisitorPass.findOne({
      visitorPhone: visitorPhoneInput,
      visitDate: { $gte: visitDayOnly, $lte: endOfVisitDay },
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (duplicatePassOnSameDay) {
      return err(res, 'Visitor already registered for this date', 400);
    }

    const currentPendingPassesCount = await VisitorPass.countDocuments({ employeeToVisit: employeeToVisitInput, status: 'Pending' });

    if (currentPendingPassesCount >= 3) {
      return err(res, 'Employee already has 3 pending visitor requests', 400);
    }

    const newlyCreatedVisitorPass = await new VisitorPass({
      visitorName: visitorNameInput, 
      visitorPhone: visitorPhoneInput, 
      visitorEmail: visitorEmailInput, 
      employeeToVisit: employeeToVisitInput,
      visitDate: visitDateObject, 
      expectedArrivalTime: expectedArrivalTimeInput, 
      purposeOfVisit: purposeOfVisitInput,
      status: 'Pending', 
      createdBy: req.user._id
    }).save();

    await logActivity({ visitorId: newlyCreatedVisitorPass._id, actionPerformed: 'Created', performedBy: req.user._id });

    const fullyPopulatedPass = await VisitorPass.findById(newlyCreatedVisitorPass._id)
      .populate('employeeToVisit', 'name email department')
      .populate('createdBy', 'name email');

    return ok(res, fullyPopulatedPass, 'Success', 201);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const searchVisitorName = req.query.visitorName;
    const searchEmployeeId = req.query.employeeId;
    const searchDate = req.query.date;
    const searchStatus = req.query.status;
    const generalSearch = req.query.search;
    
    let builtQuery = {};

    if (searchStatus) {
      builtQuery.status = searchStatus;
    } else {
      builtQuery.status = { $ne: 'Cancelled' };
    }

    if (searchVisitorName) {
      builtQuery.visitorName = { $regex: searchVisitorName, $options: 'i' };
    }

    if (searchDate) {
      const parsedSearchDate = new Date(searchDate);
      const startOfSearchDay = new Date(parsedSearchDate.getFullYear(), parsedSearchDate.getMonth(), parsedSearchDate.getDate());
      const endOfSearchDay = new Date(startOfSearchDay);
      endOfSearchDay.setHours(23, 59, 59, 999);
      builtQuery.visitDate = { $gte: startOfSearchDay, $lte: endOfSearchDay };
    }

    if (generalSearch) {
      builtQuery.$or = [{ visitorName: { $regex: generalSearch, $options: 'i' } }];
    }

    if (searchEmployeeId) {
      builtQuery.employeeToVisit = searchEmployeeId;
    }

    if (req.user.role === 'Employee') {
      builtQuery.employeeToVisit = req.user._id;
    }

    const allVisitorPassesFound = await VisitorPass.find(builtQuery)
      .populate('employeeToVisit', 'name department')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return ok(res, allVisitorPassesFound);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const thePassId = req.params.id;
    const foundPass = await VisitorPass.findById(thePassId)
      .populate('employeeToVisit', 'name email department')
      .populate('createdBy', 'name email');

    if (!foundPass) {
      return err(res, 'Visitor pass not found', 404);
    }

    const passActivityLogs = await ActivityLog.find({ visitorId: thePassId })
      .populate('performedBy', 'name role')
      .sort({ timestamp: 1 });

    const finalResultToReturn = { pass: foundPass, activityLogs: passActivityLogs };
    return ok(res, finalResultToReturn);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const approveVisitor = async (req, res) => {
  try {
    const thePassIdToApprove = req.params.id;
    const passToApprove = await VisitorPass.findById(thePassIdToApprove);

    if (!passToApprove) {
      return err(res, 'Visitor pass not found', 404);
    }
    if (passToApprove.status !== 'Pending') {
      return err(res, 'Only pending requests can be approved', 400);
    }
    if (passToApprove.employeeToVisit.toString() !== req.user._id.toString()) {
      return err(res, 'You can only approve your own visitor requests', 403);
    }

    passToApprove.status = 'Approved';
    if (req.body.remarks) {
      passToApprove.remarks = req.body.remarks;
    }

    const completelySavedPass = await passToApprove.save();
    await logActivity({ visitorId: completelySavedPass._id, actionPerformed: 'Approved', performedBy: req.user._id, notes: req.body.remarks });

    return ok(res, completelySavedPass);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const rejectVisitor = async (req, res) => {
  try {
    const thePassIdToReject = req.params.id;
    const passToReject = await VisitorPass.findById(thePassIdToReject);

    if (!passToReject) {
      return err(res, 'Visitor pass not found', 404);
    }
    if (passToReject.status !== 'Pending') {
      return err(res, 'Only pending requests can be rejected', 400);
    }
    if (passToReject.employeeToVisit.toString() !== req.user._id.toString()) {
      return err(res, 'You can only reject your own visitor requests', 403);
    }

    passToReject.status = 'Rejected';
    passToReject.remarks = req.body.remarks;

    const completelySavedPass = await passToReject.save();
    await logActivity({ visitorId: completelySavedPass._id, actionPerformed: 'Rejected', performedBy: req.user._id, notes: req.body.remarks });

    return ok(res, completelySavedPass);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const checkInVisitor = async (req, res) => {
  try {
    const thePassIdToCheckIn = req.params.id;
    const passToCheckIn = await VisitorPass.findById(thePassIdToCheckIn);

    if (!passToCheckIn) {
      return err(res, 'Visitor pass not found', 404);
    }
    if (passToCheckIn.status === 'Rejected') {
      return err(res, 'Cannot check in a rejected request', 400);
    }
    if (passToCheckIn.status !== 'Approved') {
      return err(res, 'Visitor must be approved before check-in', 400);
    }
    if (passToCheckIn.status === 'CheckedIn') {
      return err(res, 'Visitor is already checked in', 400);
    }

    passToCheckIn.status = 'CheckedIn';
    passToCheckIn.checkInTime = new Date();

    const completelySavedPass = await passToCheckIn.save();
    await logActivity({ visitorId: completelySavedPass._id, actionPerformed: 'Checked In', performedBy: req.user._id });

    return ok(res, completelySavedPass);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const thePassIdToCheckOut = req.params.id;
    const passToCheckOut = await VisitorPass.findById(thePassIdToCheckOut);

    if (!passToCheckOut) {
      return err(res, 'Visitor pass not found', 404);
    }
    if (passToCheckOut.status !== 'CheckedIn') {
      return err(res, 'Visitor must be checked in before check-out', 400);
    }

    const theCurrentTimeNow = new Date();
    if (theCurrentTimeNow <= passToCheckOut.checkInTime) {
      return err(res, 'Check-out time must be later than check-in time', 400);
    }

    passToCheckOut.status = 'CheckedOut';
    passToCheckOut.checkOutTime = theCurrentTimeNow;

    const completelySavedPass = await passToCheckOut.save();
    await logActivity({ visitorId: completelySavedPass._id, actionPerformed: 'Checked Out', performedBy: req.user._id });

    return ok(res, completelySavedPass);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const cancelVisit = async (req, res) => {
  try {
    const thePassIdToCancel = req.params.id;
    const passToCancel = await VisitorPass.findById(thePassIdToCancel);

    if (!passToCancel) {
      return err(res, 'Visitor pass not found', 404);
    }
    if (passToCancel.status === 'CheckedIn' || passToCancel.status === 'CheckedOut') {
      return err(res, 'Cannot cancel an active or completed visit', 400);
    }

    passToCancel.status = 'Cancelled';

    const completelySavedPass = await passToCancel.save();
    await logActivity({ visitorId: completelySavedPass._id, actionPerformed: 'Cancelled', performedBy: req.user._id });

    return ok(res, completelySavedPass);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};

export const getVisitorLogs = async (req, res) => {
  try {
    const thePassIdForLogs = req.params.id;
    const foundLogsForVisitor = await ActivityLog.find({ visitorId: thePassIdForLogs })
      .populate('performedBy', 'name role')
      .sort({ timestamp: 1 });

    return ok(res, foundLogsForVisitor);
  } catch (caughtError) {
    return handleErrorValidation(res, caughtError);
  }
};
