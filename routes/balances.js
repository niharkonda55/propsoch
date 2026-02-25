const express = require('express');
const router = express.Router();
const BalanceController = require('../controllers/BalanceController');
const { userIdMiddleware } = require('../middleware/validation');

/**
 * Balance Routes
 */

// Get all balances for user
router.get('/', userIdMiddleware, BalanceController.getBalances);

// Get balance with specific user
router.get('/:otherUserId', userIdMiddleware, BalanceController.getBalanceWithUser);

// Get settlements needed
router.get('/settlements/all', userIdMiddleware, BalanceController.getSettlements);

// Settle a balance
router.post('/settle', userIdMiddleware, BalanceController.settleBalance);

module.exports = router;
