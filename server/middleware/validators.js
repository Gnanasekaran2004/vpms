export const validateVisitor = [
  body('visitorName').notEmpty().withMessage('Name is required'),
  body('visitorEmail').isEmail().withMessage('Valid email required'),
  body
];