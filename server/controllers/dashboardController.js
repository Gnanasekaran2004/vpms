import VisitorPass from '../models/VisitorPass.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);
    
    const userRole = req.user.role;
    let dashboardStats = {};
    
    if (userRole === 'Administrator') {
      const [aggResult] = await VisitorPass.aggregate([
        {
          $facet: {
            pendingRequests: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            todaysVisitors: [{ $match: { visitDate: { $gte: todayStart, $lte: todayEnd } } }, { $count: 'count' }],
            visitorsInsideNow: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            scheduledVisitors: [{ $match: { status: 'Approved', visitDate: { $gte: todayStart, $lte: todayEnd } } }, { $count: 'count' }],
            totalVisitors: [{ $count: 'count' }]
          }
        }
      ]);

      const totalEmployees = await User.countDocuments({ role: 'Employee', isActive: true });
      
      dashboardStats = {
        pendingRequests: aggResult.pendingRequests[0]?.count || 0,
        todaysVisitors: aggResult.todaysVisitors[0]?.count || 0,
        visitorsInsideNow: aggResult.visitorsInsideNow[0]?.count || 0,
        totalEmployees,
        scheduledVisitors: aggResult.scheduledVisitors[0]?.count || 0,
        totalVisitors: aggResult.totalVisitors[0]?.count || 0
      };
    } else if (userRole === 'Receptionist') {
      const [aggResult] = await VisitorPass.aggregate([
        {
          $facet: {
            pendingRequests: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            todaysVisitors: [{ $match: { visitDate: { $gte: todayStart, $lte: todayEnd } } }, { $count: 'count' }],
            visitorsInsideNow: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            approvedToday: [{ $match: { status: 'Approved', visitDate: { $gte: todayStart, $lte: todayEnd } } }, { $count: 'count' }]
          }
        }
      ]);
      
      dashboardStats = {
        pendingRequests: aggResult.pendingRequests[0]?.count || 0,
        todaysVisitors: aggResult.todaysVisitors[0]?.count || 0,
        visitorsInsideNow: aggResult.visitorsInsideNow[0]?.count || 0,
        approvedToday: aggResult.approvedToday[0]?.count || 0
      };
    } else if (userRole === 'Employee') {
      const employeeFilterId = req.user._id;
      const [aggResult] = await VisitorPass.aggregate([
        { $match: { employeeToVisit: employeeFilterId } },
        {
          $facet: {
            pendingRequests: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            approvedRequests: [{ $match: { status: 'Approved' } }, { $count: 'count' }],
            rejectedRequests: [{ $match: { status: 'Rejected' } }, { $count: 'count' }],
            todaysVisitors: [{ $match: { visitDate: { $gte: todayStart, $lte: todayEnd } } }, { $count: 'count' }]
          }
        }
      ]);
      
      dashboardStats = {
        pendingRequests: aggResult.pendingRequests[0]?.count || 0,
        approvedRequests: aggResult.approvedRequests[0]?.count || 0,
        rejectedRequests: aggResult.rejectedRequests[0]?.count || 0,
        todaysVisitors: aggResult.todaysVisitors[0]?.count || 0
      };
    }
    
    return successResponse(res, dashboardStats);
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
};
