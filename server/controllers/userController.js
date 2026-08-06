import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getAllUsers = async (req, res) => {
  try {
    const roleFilter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(roleFilter).select('-password').sort({ createdAt: -1 });
    return successResponse(res, users);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    
    if (!name || !email || !password || !role || !department || !phone) {
      return errorResponse(res, 'Missing required fields', 400);
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }
    
    const newUser = new User({
      name,
      email,
      password,
      role,
      department,
      phone
    });
    
    const savedUser = await newUser.save();
    
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    return successResponse(res, userResponse, 'Success', 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const foundUser = await User.findById(targetUserId);
    
    if (!foundUser) {
      return errorResponse(res, 'User not found', 404);
    }
    
    const { name, email, password, role, department, phone, isActive } = req.body;
    
    if (!name || !email || !password || !role || !department || !phone) {
      return errorResponse(res, 'Missing required fields', 400);
    }
    
    foundUser.name = name;
    foundUser.email = email;
    foundUser.role = role;
    foundUser.department = department;
    foundUser.phone = phone;
    foundUser.password = password;
    if (isActive !== undefined) foundUser.isActive = isActive;
    
    const updatedUser = await foundUser.save();
    
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    
    return successResponse(res, userResponse);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const foundUser = await User.findById(targetUserId);
    
    if (!foundUser) {
      return errorResponse(res, 'User not found', 404);
    }
    
    foundUser.isActive = false;
    await foundUser.save();
    
    return successResponse(res, null, 'User deactivated successfully');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join('. '), 400);
    }
    return errorResponse(res, 'Server Error', 500);
  }
};

export const getEmployeeList = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee', isActive: true }).select('-password').sort({ name: 1 });
    return successResponse(res, employees);
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
};
