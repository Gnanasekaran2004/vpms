import mongoose from 'mongoose';
import { isValidPhoneNumber } from 'libphonenumber-js';

const visitorPassSchema = new mongoose.Schema({
  visitorName: { type: String, required: true, trim: true },
  visitorPhone: {
    type: String, required: true, trim: true,
    validate: {
      validator: function(val) { return isValidPhoneNumber(val); },
      message: myProps => myProps.value + ' is not a valid phone number.'
    }
  },
  visitorEmail: { type: String, required: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'] },
  employeeToVisit: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitDate: { type: Date, required: true },
  expectedArrivalTime: { type: Date, required: true },
  purposeOfVisit: { type: String, required: true, trim: true },
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected', 'CheckedIn', 'CheckedOut', 'Cancelled'], default: 'Pending' },
  remarks: { type: String, trim: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const VisitorPass = mongoose.model('VisitorPass', visitorPassSchema);
export default VisitorPass;
