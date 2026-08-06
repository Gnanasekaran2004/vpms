import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { err } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer')) return err(res, 'Not authorized', 401);

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || user.isActive === false) return err(res, 'Not authorized', 401);

    req.user = user;
    next();
  } catch {
    return err(res, 'Not authorized', 401);
  }
};
