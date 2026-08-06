import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    if (!userEmail || !userPassword) {
      return err(res, 'Email and password are required', 400);
    }

    const foundUser = await User.findOne({ email: userEmail }).select('+password');

    if (!foundUser || foundUser.isActive === false) {
      return err(res, 'Invalid credentials', 401);
    }

    const isPasswordGood = await foundUser.comparePassword(userPassword);

    if (isPasswordGood === false) {
      return err(res, 'Invalid credentials', 401);
    }

    const generatedToken = jwt.sign(
      { userId: foundUser._id, role: foundUser.role, name: foundUser.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const dataToSend = {
      token: generatedToken,
      user: {
        _id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        department: foundUser.department,
        phone: foundUser.phone,
      },
    };

    return ok(res, dataToSend);
  } catch (caughtError) {
    return err(res, 'Server Error', 500);
  }
};

export const getMe = async (req, res) => {
  return ok(res, req.user);
};
