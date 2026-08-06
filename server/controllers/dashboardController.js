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
      const pendingRequests = await VisitorPass.countDocuments({ status: 'Pending' });
      const todaysVisitors = await VisitorPass.countDocuments({ visitDate: { $gte: todayStart, $lte: todayEnd } });
      const visitorsInsideNow = await VisitorPass.countDocuments({ status: 'CheckedIn' });
      const totalEmployees = await User.countDocuments({ role: 'Employee', isActive: true });
      const scheduledVisitors = await VisitorPass.countDocuments({ status: 'Approved', visitDate: { $gte: todayStart, $lte: todayEnd } });
      const totalVisitors = await VisitorPass.countDocuments({});
      
      dashboardStats = {
        pendingRequests,
        todaysVisitors,
        visitorsInsideNow,
        totalEmployees,
        scheduledVisitors,
        totalVisitors
      };
    } else if (userRole === 'Receptionist') {
      const pendingRequests = await VisitorPass.countDocuments({ status: 'Pending' });
      const todaysVisitors = await VisitorPass.countDocuments({ visitDate: { $gte: todayStart, $lte: todayEnd } });
      const visitorsInsideNow = await VisitorPass.countDocuments({ status: 'CheckedIn' });
      const approvedToday = await VisitorPass.countDocuments({ status: 'Approved', visitDate: { $gte: todayStart, $lte: todayEnd } });
      
      dashboardStats = {
        pendingRequests,
        todaysVisitors,
        visitorsInsideNow,
        approvedToday
      };
    } else if (userRole === 'Employee') {
      const employeeFilterId = req.user._id;
      const pendingRequests = await VisitorPass.countDocuments({ employeeToVisit: employeeFilterId, status: 'Pending' });
      const approvedRequests = await VisitorPass.countDocuments({ employeeToVisit: employeeFilterId, status: 'Approved' });
      const rejectedRequests = await VisitorPass.countDocuments({ employeeToVisit: employeeFilterId, status: 'Rejected' });
      const todaysVisitors = await VisitorPass.countDocuments({ employeeToVisit: employeeFilterId, visitDate: { $gte: todayStart, $lte: todayEnd } });
      
      dashboardStats = {
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        todaysVisitors
      };
    }
    
    return successResponse(res, dashboardStats);
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
};
