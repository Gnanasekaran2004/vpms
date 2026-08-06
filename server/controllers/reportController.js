import VisitorPass from '../models/VisitorPass.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getVisitorReport = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    let dateFilterQuery = {};
    
    const currentDate = new Date();
    
    if (range === 'today') {
      const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setHours(23, 59, 59, 999);
      
      dateFilterQuery = { visitDate: { $gte: todayStart, $lte: todayEnd } };
    } else if (range === 'week') {
      const startOfWeekDay = currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1);
      const startOfWeek = new Date(currentDate.setDate(startOfWeekDay));
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      dateFilterQuery = { visitDate: { $gte: startOfWeek, $lte: endOfWeek } };
    } else if (range === 'custom' && startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);
      
      dateFilterQuery = { visitDate: { $gte: parsedStartDate, $lte: parsedEndDate } };
    }
    
    const retrievedVisitors = await VisitorPass.find(dateFilterQuery)
      .populate('employeeToVisit', 'name department')
      .populate('createdBy', 'name')
      .sort({ visitDate: -1 });
      
    const reportStats = {
      totalRegistrations: retrievedVisitors.length,
      approved: retrievedVisitors.filter(visitorPass => visitorPass.status === 'Approved').length,
      rejected: retrievedVisitors.filter(visitorPass => visitorPass.status === 'Rejected').length,
      checkedIn: retrievedVisitors.filter(visitorPass => visitorPass.status === 'CheckedIn').length,
      checkedOut: retrievedVisitors.filter(visitorPass => visitorPass.status === 'CheckedOut').length,
      cancelled: retrievedVisitors.filter(visitorPass => visitorPass.status === 'Cancelled').length,
      pending: retrievedVisitors.filter(visitorPass => visitorPass.status === 'Pending').length
    };
    
    const responsePayload = {
      stats: reportStats,
      visitors: retrievedVisitors
    };
    
    return successResponse(res, responsePayload);
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
};
