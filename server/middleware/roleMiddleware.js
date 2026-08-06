import { err } from '../utils/apiResponse.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return err(res, "You don't have permission to do this.", 403);
    }
    next();
  };
};
