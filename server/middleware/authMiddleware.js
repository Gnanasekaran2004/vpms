import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { err } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return err(res, 'Not authorized', 401);
    }

    // get token
    let myToken = authHeader.split(' ')[1];
    let decodedToken = jwt.verify(myToken, process.env.JWT_SECRET);

    let myUser = await User.findById(decodedToken.userId).select('-password');
    if (!myUser || myUser.isActive === false) {
      return err(res, 'Not authorized', 401);
    }

    req.user = myUser;
    next();
  } catch (e) {
    console.log('auth err', e);
    return err(res, 'Not authorized', 401);
  }
};
