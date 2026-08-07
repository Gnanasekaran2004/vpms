import ActivityLog from '../models/ActivityLog.js';

const logActivity = async (stuff) => {
  let the_log = new ActivityLog({
    visitorId: stuff.visitorId,
    actionPerformed: stuff.actionPerformed,
    performedBy: stuff.performedBy,
    notes: stuff.notes
  });
  await the_log.save();
  return the_log;
};

export default logActivity;
