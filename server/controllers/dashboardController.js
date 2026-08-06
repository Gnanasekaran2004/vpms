import VisitorPass from '../models/VisitorPass.js';
import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res) => {
  try {
    const theCurrentDateNow = new Date();
    const theStartOfToday = new Date(theCurrentDateNow.getFullYear(), theCurrentDateNow.getMonth(), theCurrentDateNow.getDate());
    const theEndOfToday = new Date(theStartOfToday);
    theEndOfToday.setHours(23, 59, 59, 999);
    
    const theUserRole = req.user.role;
    let finalDashboardStatsToReturn = {};
    
    if (theUserRole === 'Administrator') {
      const aggregationResultArray = await VisitorPass.aggregate([
        {
          $facet: {
            pendingRequestsCount: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            todaysVisitorsCount: [{ $match: { visitDate: { $gte: theStartOfToday, $lte: theEndOfToday } } }, { $count: 'count' }],
            visitorsInsideNowCount: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            scheduledVisitorsCount: [{ $match: { status: 'Approved', visitDate: { $gte: theStartOfToday, $lte: theEndOfToday } } }, { $count: 'count' }],
            totalVisitorsCount: [{ $count: 'count' }]
          }
        }
      ]);
      const theAggregatedData = aggregationResultArray[0];

      const totalActiveEmployeesNumber = await User.countDocuments({ role: 'Employee', isActive: true });
      
      let pendingRequestsVal = 0;
      if (theAggregatedData.pendingRequestsCount[0]) pendingRequestsVal = theAggregatedData.pendingRequestsCount[0].count;

      let todaysVisitorsVal = 0;
      if (theAggregatedData.todaysVisitorsCount[0]) todaysVisitorsVal = theAggregatedData.todaysVisitorsCount[0].count;

      let visitorsInsideNowVal = 0;
      if (theAggregatedData.visitorsInsideNowCount[0]) visitorsInsideNowVal = theAggregatedData.visitorsInsideNowCount[0].count;

      let scheduledVisitorsVal = 0;
      if (theAggregatedData.scheduledVisitorsCount[0]) scheduledVisitorsVal = theAggregatedData.scheduledVisitorsCount[0].count;

      let totalVisitorsVal = 0;
      if (theAggregatedData.totalVisitorsCount[0]) totalVisitorsVal = theAggregatedData.totalVisitorsCount[0].count;

      finalDashboardStatsToReturn = {
        pendingRequests: pendingRequestsVal,
        todaysVisitors: todaysVisitorsVal,
        visitorsInsideNow: visitorsInsideNowVal,
        totalEmployees: totalActiveEmployeesNumber,
        scheduledVisitors: scheduledVisitorsVal,
        totalVisitors: totalVisitorsVal
      };
    } else if (theUserRole === 'Receptionist') {
      const aggregationResultArray = await VisitorPass.aggregate([
        {
          $facet: {
            pendingRequestsCount: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            todaysVisitorsCount: [{ $match: { visitDate: { $gte: theStartOfToday, $lte: theEndOfToday } } }, { $count: 'count' }],
            visitorsInsideNowCount: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            approvedTodayCount: [{ $match: { status: 'Approved', visitDate: { $gte: theStartOfToday, $lte: theEndOfToday } } }, { $count: 'count' }]
          }
        }
      ]);
      const theAggregatedData = aggregationResultArray[0];
      
      let pendingRequestsVal = 0;
      if (theAggregatedData.pendingRequestsCount[0]) pendingRequestsVal = theAggregatedData.pendingRequestsCount[0].count;

      let todaysVisitorsVal = 0;
      if (theAggregatedData.todaysVisitorsCount[0]) todaysVisitorsVal = theAggregatedData.todaysVisitorsCount[0].count;

      let visitorsInsideNowVal = 0;
      if (theAggregatedData.visitorsInsideNowCount[0]) visitorsInsideNowVal = theAggregatedData.visitorsInsideNowCount[0].count;

      let approvedTodayVal = 0;
      if (theAggregatedData.approvedTodayCount[0]) approvedTodayVal = theAggregatedData.approvedTodayCount[0].count;

      finalDashboardStatsToReturn = {
        pendingRequests: pendingRequestsVal,
        todaysVisitors: todaysVisitorsVal,
        visitorsInsideNow: visitorsInsideNowVal,
        approvedToday: approvedTodayVal
      };
    } else if (theUserRole === 'Employee') {
      const theEmployeeFilterId = req.user._id;
      const aggregationResultArray = await VisitorPass.aggregate([
        { $match: { employeeToVisit: theEmployeeFilterId } },
        {
          $facet: {
            pendingRequestsCount: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            approvedRequestsCount: [{ $match: { status: 'Approved' } }, { $count: 'count' }],
            rejectedRequestsCount: [{ $match: { status: 'Rejected' } }, { $count: 'count' }],
            todaysVisitorsCount: [{ $match: { visitDate: { $gte: theStartOfToday, $lte: theEndOfToday } } }, { $count: 'count' }]
          }
        }
      ]);
      const theAggregatedData = aggregationResultArray[0];
      
      let pendingRequestsVal = 0;
      if (theAggregatedData.pendingRequestsCount[0]) pendingRequestsVal = theAggregatedData.pendingRequestsCount[0].count;

      let approvedRequestsVal = 0;
      if (theAggregatedData.approvedRequestsCount[0]) approvedRequestsVal = theAggregatedData.approvedRequestsCount[0].count;

      let rejectedRequestsVal = 0;
      if (theAggregatedData.rejectedRequestsCount[0]) rejectedRequestsVal = theAggregatedData.rejectedRequestsCount[0].count;

      let todaysVisitorsVal = 0;
      if (theAggregatedData.todaysVisitorsCount[0]) todaysVisitorsVal = theAggregatedData.todaysVisitorsCount[0].count;

      finalDashboardStatsToReturn = {
        pendingRequests: pendingRequestsVal,
        approvedRequests: approvedRequestsVal,
        rejectedRequests: rejectedRequestsVal,
        todaysVisitors: todaysVisitorsVal
      };
    }
    
    return ok(res, finalDashboardStatsToReturn);
  } catch (caughtError) {
    return err(res, 'Server Error', 500);
  }
};
