import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }
    
    const foundUser = await User.findOne({ email }).select('+password');
    
    if (!foundUser || !foundUser.isActive) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    const isPasswordMatch = await foundUser.comparePassword(password);
    
    if (!isPasswordMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    const tokenPayload = {
      userId: foundUser._id,
      role: foundUser.role,
      name: foundUser.name
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    const userResponse = {
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      department: foundUser.department,
      phone: foundUser.phone
    };
    
    return successResponse(res, { token, user: userResponse });
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
};

export const getMe = async (req, res) => {
  return successResponse(res, req.user);
};
