const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { validateUserRegistration, validateUserUpdate, userIdMiddleware } = require('../middleware/validation');

/**
 * User Routes
 */

// Register a new user
router.post('/register', validateUserRegistration(), UserController.register);

// Get user profile
router.get('/:userId', userIdMiddleware, UserController.getProfile);

// Update user profile
router.put('/:userId', userIdMiddleware, validateUserUpdate(), UserController.updateProfile);

// Change password
router.post('/:userId/change-password', userIdMiddleware, UserController.changePassword);

// Delete account
router.delete('/:userId', userIdMiddleware, UserController.deleteAccount);

module.exports = router;
