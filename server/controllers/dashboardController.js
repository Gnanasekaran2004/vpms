import VisitorPass from '../models/VisitorPass.js';
import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res) => {
  try {
    const c = facet => facet[0]?.count || 0;

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const { role } = req.user;
    let stats = {};

    if (role === 'Administrator') {
      const [agg] = await VisitorPass.aggregate([
        {
          $facet: {
            pendingRequests: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            todaysVisitors: [{ $match: { visitDate: { $gte: dayStart, $lte: dayEnd } } }, { $count: 'count' }],
            visitorsInsideNow: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            scheduledVisitors: [{ $match: { status: 'Approved', visitDate: { $gte: dayStart, $lte: dayEnd } } }, { $count: 'count' }],
            totalVisitors: [{ $count: 'count' }]
          }
        }
      ]);
      const totalEmployees = await User.countDocuments({ role: 'Employee', isActive: true });
      stats = {
        pendingRequests: c(agg.pendingRequests),
        todaysVisitors: c(agg.todaysVisitors),
        visitorsInsideNow: c(agg.visitorsInsideNow),
        totalEmployees,
        scheduledVisitors: c(agg.scheduledVisitors),
        totalVisitors: c(agg.totalVisitors)
      };
    } else if (role === 'Receptionist') {
      const [agg] = await VisitorPass.aggregate([
        {
          $facet: {
            pendingRequests: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            todaysVisitors: [{ $match: { visitDate: { $gte: dayStart, $lte: dayEnd } } }, { $count: 'count' }],
            visitorsInsideNow: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            approvedToday: [{ $match: { status: 'Approved', visitDate: { $gte: dayStart, $lte: dayEnd } } }, { $count: 'count' }]
          }
        }
      ]);
      stats = {
        pendingRequests: c(agg.pendingRequests),
        todaysVisitors: c(agg.todaysVisitors),
        visitorsInsideNow: c(agg.visitorsInsideNow),
        approvedToday: c(agg.approvedToday)
      };
    } else if (role === 'Employee') {
      const empId = req.user._id;
      const [agg] = await VisitorPass.aggregate([
        { $match: { employeeToVisit: empId } },
        {
          $facet: {
            pendingRequests: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            approvedRequests: [{ $match: { status: 'Approved' } }, { $count: 'count' }],
            rejectedRequests: [{ $match: { status: 'Rejected' } }, { $count: 'count' }],
            todaysVisitors: [{ $match: { visitDate: { $gte: dayStart, $lte: dayEnd } } }, { $count: 'count' }]
          }
        }
      ]);
      stats = {
        pendingRequests: c(agg.pendingRequests),
        approvedRequests: c(agg.approvedRequests),
        rejectedRequests: c(agg.rejectedRequests),
        todaysVisitors: c(agg.todaysVisitors)
      };
    }

    return ok(res, stats);
  } catch (e) {
    return err(res, 'Server Error', 500);
  }
};
