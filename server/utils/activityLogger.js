import ActivityLog from '../models/ActivityLog.js';

const logActivity = async ({ visitorId, actionPerformed, performedBy, notes }) => {
  return await new ActivityLog({ visitorId, actionPerformed, performedBy, notes }).save();
};

export default logActivity;
