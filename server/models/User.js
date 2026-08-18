import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isValidPhoneNumber } from 'libphonenumber-js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'] },
  password: {
    type: String, required: true,
    validate: {
      validator: function(val) {
        if (!this.isModified('password')) return true;
        // check pass
        let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{13,}$/;
        return regex.test(val);
      },
      message: 'Password must be at least 13 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }
  },
  role: { type: String, required: true, enum: ['Administrator', 'Receptionist', 'Employee'] },
  department: { type: String, required: true, trim: true },
  phone: {
    type: String, required: true, trim: true,
    validate: {
      validator: function(val) {
        return isValidPhoneNumber(val);
      },
      message: myProps => myProps.value + ' is not a valid phone number.'
    }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// hash pass before save
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    let salt = 10;
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function(passToCheck) {
  let isMatch = await bcrypt.compare(passToCheck, this.password);
  return isMatch;
};
userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model('User', userSchema);
export default User;
