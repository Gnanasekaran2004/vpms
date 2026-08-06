import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { isValidPhoneNumber } from 'libphonenumber-js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        if (!this.isModified('password')) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{13,}$/.test(v);
      },
      message: 'Password must be at least 13 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }
  },
  role: {
    type: String,
    required: true,
    enum: ['Administrator', 'Receptionist', 'Employee']
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return isValidPhoneNumber(v);
      },
      message: props => `${props.value} is not a valid phone number.`
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcryptjs.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
