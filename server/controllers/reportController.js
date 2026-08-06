import VisitorPass from '../models/VisitorPass.js';
import { ok, err } from '../utils/apiResponse.js';

export const getVisitorReport = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    let dateRange = {};

    const now = new Date();

    if (range === 'today') {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      dateRange = { visitDate: { $gte: dayStart, $lte: dayEnd } };
    } else if (range === 'week') {
      const startOfWeekDay = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(startOfWeekDay));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      dateRange = { visitDate: { $gte: weekStart, $lte: weekEnd } };
    } else if (range === 'custom' && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      dateRange = { visitDate: { $gte: s, $lte: e } };
    }

    const records = await VisitorPass.find(dateRange)
      .populate('employeeToVisit', 'name department')
      .populate('createdBy', 'name')
      .sort({ visitDate: -1 });

    const byStatus = status => records.filter(r => r.status === status).length;

    const stats = {
      totalRegistrations: records.length,
      approved: byStatus('Approved'),
      rejected: byStatus('Rejected'),
      checkedIn: byStatus('CheckedIn'),
      checkedOut: byStatus('CheckedOut'),
      cancelled: byStatus('Cancelled'),
      pending: byStatus('Pending')
    };

    return ok(res, { stats, visitors: records });
  } catch (e) {
    return err(res, 'Server Error', 500);
  }
};
