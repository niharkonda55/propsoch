const { Balance, User } = require('../models');
const { Op } = require('sequelize');

class BalanceController {
  /**
   * Get balances for a user
   * GET /api/balances
   */
  static async getBalances(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;

      // Get all balances for this user
      const balances = await Balance.findAll({
        where: {
          [Op.or]: [
            { userId },
            { targetUserId: userId },
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'targetUser',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      // Format response to show summary
      const summary = {};

      balances.forEach(balance => {
        const key = balance.userId === userId ? `owes_${balance.targetUserId}` : `owed_by_${balance.userId}`;
        
        if (balance.userId === userId) {
          // User owes
          summary[key] = {
            type: 'owes',
            amount: parseFloat(balance.amount),
            currency: balance.currency,
            toUser: balance.targetUser,
          };
        } else {
          // User is owed
          summary[key] = {
            type: 'owed_by',
            amount: parseFloat(balance.amount),
            currency: balance.currency,
            fromUser: balance.user,
          };
        }
      });

      return res.status(200).json({ data: balances, summary });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get balance between two users
   * GET /api/balances/:otherUserId
   */
  static async getBalanceWithUser(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      const { otherUserId } = req.params;

      // Check balances both directions
      const userTOther = await Balance.findOne({
        where: {
          userId,
          targetUserId: parseInt(otherUserId),
        },
      });

      const otherTUser = await Balance.findOne({
        where: {
          userId: parseInt(otherUserId),
          targetUserId: userId,
        },
      });

      const otherUser = await User.findByPk(otherUserId, {
        attributes: ['id', 'name', 'email'],
      });

      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      let netBalance = 0;
      let direction = 'even'; // 'even', 'owes', 'owed_by'

      if (userTOther && otherTUser) {
        const diff = parseFloat(userTOther.amount) - parseFloat(otherTUser.amount);
        if (diff > 0) {
          direction = 'owes';
          netBalance = diff;
        } else if (diff < 0) {
          direction = 'owed_by';
          netBalance = Math.abs(diff);
        }
      } else if (userTOther) {
        direction = 'owes';
        netBalance = parseFloat(userTOther.amount);
      } else if (otherTUser) {
        direction = 'owed_by';
        netBalance = parseFloat(otherTUser.amount);
      }

      return res.status(200).json({
        data: {
          otherUser,
          netBalance,
          direction,
          userTOther: userTOther ? parseFloat(userTOther.amount) : 0,
          otherTUser: otherTUser ? parseFloat(otherTUser.amount) : 0,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get settlements needed
   * GET /api/balances/settlements/all
   */
  static async getSettlements(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;

      // Get all non-zero balances for this user
      const balances = await Balance.findAll({
        where: {
          [Op.or]: [
            { userId, amount: { [Op.gt]: 0 } },
            { targetUserId: userId, amount: { [Op.gt]: 0 } },
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'targetUser',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      const settlements = balances.map(balance => {
        if (balance.userId === userId) {
          return {
            id: balance.id,
            owesTo: balance.targetUser,
            amount: parseFloat(balance.amount),
            currency: balance.currency,
          };
        } else {
          return {
            id: balance.id,
            owedBy: balance.user,
            amount: parseFloat(balance.amount),
            currency: balance.currency,
          };
        }
      });

      return res.status(200).json({ data: settlements });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Settle a balance between two users
   * POST /api/balances/settle
   */
  static async settleBalance(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      const { otherUserId, amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than zero' });
      }

      const userTOther = await Balance.findOne({
        where: {
          userId,
          targetUserId: parseInt(otherUserId),
        },
      });

      if (!userTOther || parseFloat(userTOther.amount) < parseFloat(amount)) {
        return res.status(400).json({ message: 'Insufficient balance to settle' });
      }

      userTOther.amount = parseFloat(userTOther.amount) - parseFloat(amount);
      await userTOther.save();

      return res.status(200).json({
        message: 'Balance settled successfully',
        data: {
          remainingBalance: parseFloat(userTOther.amount),
          settledAmount: parseFloat(amount),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = BalanceController;
