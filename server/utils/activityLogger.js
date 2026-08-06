import ActivityLog from '../models/ActivityLog.js';

const logActivity = async (stuff) => {
  let theLog = new ActivityLog({
    visitorId: stuff.visitorId,
    actionPerformed: stuff.actionPerformed,
    performedBy: stuff.performedBy,
    notes: stuff.notes
  });
  await theLog.save();
  return theLog;
};

export default logActivity;
