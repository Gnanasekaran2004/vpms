import VisitorPass from '../models/VisitorPass.js';
import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';
export const getDashboardStats = async (req, res) => {
  try {
    const CurrentDate = new Date();
    const BeginingDate = new Date(CurrentDate.getFullYear(), CurrentDate.getMonth(), CurrentDate.getDate());
    const EndDate = new Date(BeginingDate);
    EndDate.setHours(23, 59, 59, 999);
    
    const Users_Role = req.user.role;
    let finaldashboard_statstoreturn = {};
    
    if (Users_Role === 'Administrator') {
      const agg_Result_Array = await VisitorPass.aggregate([
        {
          $facet: {
            Pending_req_Count: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            Today_vist_count: [{ $match: { visitDate: { $gte: BeginingDate, $lte: EndDate } } }, { $count: 'count' }],
            visitorsInsidenow_count: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            scheduledVisitors_count: [{ $match: { status: 'Approved', visitDate: { $gte: BeginingDate, $lte: EndDate } } }, { $count: 'count' }],
            totalVisitors_count: [{ $count: 'count' }]
          }
        }
      ]);
      const agg_Data = agg_Result_Array[0];

      const Active_Employees_No = await User.countDocuments({ role: 'Employee', isActive: true });
      
      let Pending_req = 0;
      if (agg_Data.Pending_req_Count[0]) Pending_req = agg_Data.Pending_req_Count[0].count;

      let today_visitorsval = 0;
      if (agg_Data.Today_vist_count[0]) today_visitorsval = agg_Data.Today_vist_count[0].count;

      let Now_visitorInsideval = 0;
      if (agg_Data.visitorsInsidenow_count[0]) Now_visitorInsideval = agg_Data.visitorsInsidenow_count[0].count;

      let scheduled_visitorsval = 0;
      if (agg_Data.scheduledVisitors_count[0]) scheduled_visitorsval = agg_Data.scheduledVisitors_count[0].count;

      let total_visitorsval = 0;
      if (agg_Data.totalVisitors_count[0]) total_visitorsval = agg_Data.totalVisitors_count[0].count;

      finaldashboard_statstoreturn = {
        pendingRequests: Pending_req,
        todaysVisitors: today_visitorsval,
        visitorsInsideNow: Now_visitorInsideval,
        totalEmployees: Active_Employees_No,
        scheduledVisitors: scheduled_visitorsval,
        totalVisitors: total_visitorsval
      };
    } else if (Users_Role === 'Receptionist') {
      const agg_Result_Array = await VisitorPass.aggregate([
        {
          $facet: {
            Pending_req_Count: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            Today_vist_count: [{ $match: { visitDate: { $gte: BeginingDate, $lte: EndDate } } }, { $count: 'count' }],
            visitorsInsidenow_count: [{ $match: { status: 'CheckedIn' } }, { $count: 'count' }],
            approvedTodayCount: [{ $match: { status: 'Approved', visitDate: { $gte: BeginingDate, $lte: EndDate } } }, { $count: 'count' }]
          }
        }
      ]);
      const agg_Data = agg_Result_Array[0];
      
      let Pending_req = 0;
      if (agg_Data.Pending_req_Count[0]) Pending_req = agg_Data.Pending_req_Count[0].count;

      let today_visitorsval = 0;
      if (agg_Data.Today_vist_count[0]) today_visitorsval = agg_Data.Today_vist_count[0].count;

      let Now_visitorInsideval = 0;
      if (agg_Data.visitorsInsidenow_count[0]) Now_visitorInsideval = agg_Data.visitorsInsidenow_count[0].count;

      let approvedTodayVal = 0;
      if (agg_Data.approvedTodayCount[0]) approvedTodayVal = agg_Data.approvedTodayCount[0].count;

      finaldashboard_statstoreturn = {
        pendingRequests: Pending_req,
        todaysVisitors: today_visitorsval,
        visitorsInsideNow: Now_visitorInsideval,
        approvedToday: approvedTodayVal
      };
    } else if (Users_Role === 'Employee') {
      const theEmployeeFilterId = req.user._id;
      const agg_Result_Array = await VisitorPass.aggregate([
        { $match: { employeeToVisit: theEmployeeFilterId } },
        {
          $facet: {
            Pending_req_Count: [{ $match: { status: 'Pending' } }, { $count: 'count' }],
            approvedRequestsCount: [{ $match: { status: 'Approved' } }, { $count: 'count' }],
            rejectedRequestsCount: [{ $match: { status: 'Rejected' } }, { $count: 'count' }],
            Today_vist_count: [{ $match: { visitDate: { $gte: BeginingDate, $lte: EndDate } } }, { $count: 'count' }]
          }
        }
      ]);
      const agg_Data = agg_Result_Array[0];
      
      let Pending_req = 0;
      if (agg_Data.Pending_req_Count[0]) Pending_req = agg_Data.Pending_req_Count[0].count;

      let approved_requestsval = 0;
      if (agg_Data.approvedRequestsCount[0]) approved_requestsval = agg_Data.approvedRequestsCount[0].count;

      let rejected_requestsval = 0;
      if (agg_Data.rejectedRequestsCount[0]) rejected_requestsval = agg_Data.rejectedRequestsCount[0].count;

      let today_visitorsval = 0;
      if (agg_Data.Today_vist_count[0]) today_visitorsval = agg_Data.Today_vist_count[0].count;
      finaldashboard_statstoreturn = {
        pendingRequests: Pending_req,
        approvedRequests: approved_requestsval,
        rejectedRequests: rejected_requestsval,
        todaysVisitors: today_visitorsval
      };
    }
    
    return ok(res, finaldashboard_statstoreturn);
  } catch (caughtError) {
    return err(res, 'Server Error', 500);
  }
};

export const getChartData = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartData = await VisitorPass.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          totalVisitors: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    return ok(res, chartData);
  } catch (error) {
    return err(res, 'Server Error', 500);
  }
};