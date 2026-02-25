const express = require('express');
const router = express.Router();
const ActivityLogController = require('../controllers/ActivityLogController');
const { userIdMiddleware } = require('../middleware/validation');

/**
 * Activity Log Routes
 */

// Get activity logs (with grouping)
router.get('/', userIdMiddleware, ActivityLogController.getActivityLogs);

// Get current month logs
router.get('/current-month', userIdMiddleware, ActivityLogController.getCurrentMonthLogs);

// Get last month logs
router.get('/last-month', userIdMiddleware, ActivityLogController.getLastMonthLogs);

// Get custom period logs
router.get('/custom', userIdMiddleware, ActivityLogController.getCustomPeriodLogs);

module.exports = router;
