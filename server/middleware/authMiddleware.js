import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
      return errorResponse(res, 'Not authorized', 401);
    }
    
    const token = authorizationHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const foundUser = await User.findById(decodedToken.userId).select('-password');
    
    if (!foundUser || foundUser.isActive === false) {
      return errorResponse(res, 'Not authorized', 401);
    }
    
    req.user = foundUser;
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized', 401);
  }
};
