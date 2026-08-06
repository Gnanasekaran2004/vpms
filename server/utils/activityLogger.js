import ActivityLog from '../models/ActivityLog.js';

const logActivity = async ({ visitorId, actionPerformed, performedBy, notes }) => {
  const activityLog = new ActivityLog({
    visitorId,
    actionPerformed,
    performedBy,
    notes
  });
  
  const savedLog = await activityLog.save();
  return savedLog;
};

export default logActivity;
