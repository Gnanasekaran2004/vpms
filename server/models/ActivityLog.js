import mongoose from 'mongoose';

const activitylog_schema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisitorPass', required: true },
  actionPerformed: { type: String, required: true, enum: ['Created', 'Approved', 'Rejected', 'Checked In', 'Checked Out', 'Cancelled'] },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String }
});

const ActivityLog = mongoose.model('ActivityLog', activitylog_schema);
export default ActivityLog;
