import { body, validationResult } from 'express-validator';
import { err } from '../utils/apiResponse.js';

export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => e.msg);
    return err(res, 'Validation Error', 400, errorMessages);
  }
  next();
};

export const validateVisitor = [
  body('visitorName').notEmpty().withMessage('Visitor name is required').trim(),
  body('visitorPhone').notEmpty().withMessage('Visitor phone is required').trim(),
  body('visitorEmail').isEmail().withMessage('Valid visitor email is required').normalizeEmail(),
  body('employeeToVisit').isMongoId().withMessage('Valid employee ID is required'),
  body('visitDate').isISO8601().withMessage('Valid visit date is required'),
  body('expectedArrivalTime').isISO8601().withMessage('Valid expected arrival time is required'),
  body('purposeOfVisit').notEmpty().withMessage('Purpose of visit is required').trim(),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];