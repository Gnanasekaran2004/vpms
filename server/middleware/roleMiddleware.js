import { err } from '../utils/apiResponse.js';

export const authorizeRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    // check if role matches
    let hasRole = false;
    for (let i = 0; i < rolesAllowed.length; i++) {
      if (req.user.role === rolesAllowed[i]) {
        hasRole = true;
      }
    }
    
    if (!hasRole) {
      return err(res, "You don't have permission to do this.", 403);
    }
    
    next();
  };
};
