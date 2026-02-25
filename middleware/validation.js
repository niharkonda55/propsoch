const { body, validationResult } = require('express-validator');

/**
 * Middleware to extract and validate user ID from headers
 */
const userIdMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ message: 'x-user-id header is required and must be a valid number' });
  }
  
  req.userId = parseInt(userId);
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = () => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .optional()
    .isString()
    .trim(),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters (e.g., USD)'),
];

/**
 * User update validation
 */
const validateUserUpdate = () => [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .optional()
    .isString()
    .trim(),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('phone')
    .optional()
    .isString(),
];

/**
 * Expense creation validation
 */
const validateExpenseCreation = () => [
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Expense name is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('members')
    .isArray({ min: 1 })
    .withMessage('At least one member is required'),
  body('members.*.userId')
    .isInt()
    .withMessage('Member userId must be a valid number'),
  body('members.*.shareAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Share amount must be a positive number'),
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('category')
    .optional()
    .isString()
    .trim(),
];

module.exports = {
  userIdMiddleware,
  validateUserRegistration,
  validateUserUpdate,
  validateExpenseCreation,
};
