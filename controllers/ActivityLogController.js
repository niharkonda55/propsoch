const { ActivityLog, Expense, User } = require('../models');
const { Op } = require('sequelize');

class ActivityLogController {
  /**
   * Get activity log for a user
   * GET /api/activity-logs?groupBy=month
   */
  static async getActivityLogs(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      const { groupBy = 'month', startDate, endDate } = req.query;

      let where = {
        userId,
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const logs = await ActivityLog.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'name', 'amount', 'currency', 'expenseDate'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Group by month by default
      let grouped = {};

      if (groupBy === 'month') {
        logs.forEach(log => {
          const date = new Date(log.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!grouped[monthKey]) {
            grouped[monthKey] = [];
          }
          grouped[monthKey].push(log);
        });
      } else if (groupBy === 'week') {
        logs.forEach(log => {
          const date = new Date(log.createdAt);
          const weekKey = `${date.getFullYear()}-W${String(ActivityLogController.getWeekNumber(date)).padStart(2, '0')}`;
          
          if (!grouped[weekKey]) {
            grouped[weekKey] = [];
          }
          grouped[weekKey].push(log);
        });
      } else if (groupBy === 'date') {
        logs.forEach(log => {
          const date = new Date(log.createdAt);
          const dateKey = date.toISOString().split('T')[0];
          
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(log);
        });
      } else {
        grouped['all'] = logs;
      }

      return res.status(200).json({
        data: grouped,
        groupedBy: groupBy,
        totalCount: logs.length,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get activity log for current month
   * GET /api/activity-logs/current-month
   */
  static async getCurrentMonthLogs(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const logs = await ActivityLog.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'name', 'amount', 'currency', 'expenseDate'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        data: logs,
        period: {
          start: startOfMonth,
          end: endOfMonth,
        },
        count: logs.length,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get activity log for last month
   * GET /api/activity-logs/last-month
   */
  static async getLastMonthLogs(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const logs = await ActivityLog.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'name', 'amount', 'currency', 'expenseDate'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        data: logs,
        period: {
          start: startOfMonth,
          end: endOfMonth,
        },
        count: logs.length,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get activity log for custom date range
   * GET /api/activity-logs/custom?startDate=2023-01-01&endDate=2023-12-31
   */
  static async getCustomPeriodLogs(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'startDate and endDate are required' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return res.status(400).json({ message: 'startDate must be before endDate' });
      }

      const logs = await ActivityLog.findAll({
        where: {
          userId,
          createdAt: {
            [Op.between]: [start, end],
          },
        },
        include: [
          {
            model: Expense,
            as: 'expense',
            attributes: ['id', 'name', 'amount', 'currency', 'expenseDate'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return res.status(200).json({
        data: logs,
        period: {
          start,
          end,
        },
        count: logs.length,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Helper function to get week number
   */
  static getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }
}

module.exports = ActivityLogController;
