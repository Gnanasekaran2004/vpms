import VisitorPass from '../models/VisitorPass.js';
import { ok, err } from '../utils/apiResponse.js';

export const getVisitorReport = async (req, res) => {
  try {
    const reportRangeInput = req.query.range;
    const reportStartDateInput = req.query.startDate;
    const reportEndDateInput = req.query.endDate;
    
    let constructedDateRange = {};

    const theTimeRightNow = new Date();

    if (reportRangeInput === 'today') {
      const startOfTodayDay = new Date(theTimeRightNow.getFullYear(), theTimeRightNow.getMonth(), theTimeRightNow.getDate());
      const endOfTodayDay = new Date(startOfTodayDay);
      endOfTodayDay.setHours(23, 59, 59, 999);
      constructedDateRange = { visitDate: { $gte: startOfTodayDay, $lte: endOfTodayDay } };
    } else if (reportRangeInput === 'week') {
      let calculateDayDiff = theTimeRightNow.getDay();
      if (calculateDayDiff === 0) {
        calculateDayDiff = -6;
      } else {
        calculateDayDiff = 1;
      }
      const startOfWeekDayNumber = theTimeRightNow.getDate() - theTimeRightNow.getDay() + calculateDayDiff;
      const startOfWeekDate = new Date(theTimeRightNow.setDate(startOfWeekDayNumber));
      startOfWeekDate.setHours(0, 0, 0, 0);
      const endOfWeekDate = new Date(startOfWeekDate);
      endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
      endOfWeekDate.setHours(23, 59, 59, 999);
      constructedDateRange = { visitDate: { $gte: startOfWeekDate, $lte: endOfWeekDate } };
    } else if (reportRangeInput === 'custom') {
      if (reportStartDateInput && reportEndDateInput) {
        const customStartDateParsed = new Date(reportStartDateInput);
        const customEndDateParsed = new Date(reportEndDateInput);
        customEndDateParsed.setHours(23, 59, 59, 999);
        constructedDateRange = { visitDate: { $gte: customStartDateParsed, $lte: customEndDateParsed } };
      }
    }

    const allTheFoundRecords = await VisitorPass.find(constructedDateRange)
      .populate('employeeToVisit', 'name department')
      .populate('createdBy', 'name')
      .sort({ visitDate: -1 });

    const getCountForStatus = (statusString) => {
      let runningCount = 0;
      for (let i = 0; i < allTheFoundRecords.length; i++) {
        if (allTheFoundRecords[i].status === statusString) {
          runningCount++;
        }
      }
      return runningCount;
    };

    const finalReportStats = {
      totalRegistrations: allTheFoundRecords.length,
      approved: getCountForStatus('Approved'),
      rejected: getCountForStatus('Rejected'),
      checkedIn: getCountForStatus('CheckedIn'),
      checkedOut: getCountForStatus('CheckedOut'),
      cancelled: getCountForStatus('Cancelled'),
      pending: getCountForStatus('Pending')
    };

    const objectToSendBack = { stats: finalReportStats, visitors: allTheFoundRecords };
    return ok(res, objectToSendBack);
  } catch (caughtError) {
    return err(res, 'Server Error', 500);
  }
};

export const exportVisitorReportCSV = async (req, res) => {
  try {
    const visitors = await VisitorPass.find({}).populate('employeeToVisit', 'name');
    
    let csvString = "Name,Phone,Email,Status,Visit Date,Employee To Visit\n";
    
    visitors.forEach(v => {
      const name = `"${v.visitorName}"`;
      const phone = `"${v.visitorPhone}"`;
      const email = `"${v.visitorEmail}"`;
      const status = `"${v.status}"`;
      const date = `"${new Date(v.visitDate).toLocaleDateString()}"`;
      const employee = `"${v.employeeToVisit?.name || 'N/A'}"`;
      
      csvString += `${name},${phone},${email},${status},${date},${employee}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('Visitor_Report.csv');
    return res.send(csvString);
  } catch (caughtError) {
    return err(res, 'Server Error', 500);
  }
};
