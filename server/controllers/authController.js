import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return err(res, 'Email and password are required', 400);

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) return err(res, 'Invalid credentials', 401);

    const pwOk = await user.comparePassword(password);

    if (!pwOk) return err(res, 'Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return ok(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (e) {
    return err(res, 'Server Error', 500);
  }
};

export const getMe = async (req, res) => {
  return ok(res, req.user);
};
