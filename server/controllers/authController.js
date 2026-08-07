import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ok, err } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  try {
    const Email = req.body.email;
    const Password = req.body.password;

    if (!Email || !Password) {
      return err(res, 'Email and password are required', 400);
    }

    const FoundUser = await User.findOne({ email: Email }).select('+password');

    if (!FoundUser || FoundUser.isActive === false) {
      return err(res, 'Invalid credentials', 401);
    }

    const isPasswordGood = await FoundUser.comparePassword(Password);

    if (isPasswordGood === false) {
      return err(res, 'Invalid credentials', 401);
    }

    const generatedToken = jwt.sign(
      { userId: FoundUser._id, role: FoundUser.role, name: FoundUser.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const dataToSend = {
      token: generatedToken,
      user: {
        _id: FoundUser._id,
        name: FoundUser.name,
        email: FoundUser.email,
        role: FoundUser.role,
        department: FoundUser.department,
        phone: FoundUser.phone,
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
