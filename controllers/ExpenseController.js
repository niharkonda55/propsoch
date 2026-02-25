const { Expense, ExpenseMember, User, ActivityLog, Balance, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class ExpenseController {
  /**
   * Create a new expense
   * POST /api/expenses
   */
  static async createExpense(req, res) {
    const t = await sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await t.rollback();
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.headers['x-user-id'] || req.userId;
      const { name, amount, currency, description, category, expenseDate, members } = req.body;

      if (!members || members.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Expense must have at least one member' });
      }

      // Create expense
      const expense = await Expense.create(
        {
          userId,
          name,
          amount,
          currency: currency || 'USD',
          description: description || '',
          category: category || 'Other',
          expenseDate: expenseDate || new Date(),
        },
        { transaction: t }
      );

      // Calculate share per member if equal split
      let totalShare = 0;
      const expenseMembers = [];

      for (const member of members) {
        const shareAmount = member.shareAmount || parseFloat(amount) / members.length;
        expenseMembers.push({
          expenseId: expense.id,
          userId: member.userId,
          shareAmount,
          shareType: member.shareType || 'equal',
        });
        totalShare += parseFloat(shareAmount);
      }

      // Create expense members
      await ExpenseMember.bulkCreate(expenseMembers, { transaction: t });

      // Update balances
      await ExpenseController.updateBalances(expense, expenseMembers, t);

      // Create activity log
      await ActivityLog.create(
        {
          userId,
          expenseId: expense.id,
          action: 'created',
          actionDetails: { name, amount, currency },
        },
        { transaction: t }
      );

      await t.commit();

      return res.status(201).json({
        message: 'Expense created successfully',
        data: {
          id: expense.id,
          name: expense.name,
          amount: expense.amount,
          currency: expense.currency,
          expenseDate: expense.expenseDate,
          members: expenseMembers,
        },
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get all expenses for a user
   * GET /api/expenses?userId=X&limit=10&offset=0
   */
  static async getExpenses(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.userId;
      const { limit = 10, offset = 0, category, startDate, endDate } = req.query;

      let where = {};
      if (category) {
        where.category = category;
      }
      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate[Op.gte] = new Date(startDate);
        if (endDate) where.expenseDate[Op.lte] = new Date(endDate);
      }

      // Get expenses created by user or where user is a member
      const expenses = await Expense.findAll({
        include: [
          {
            model: ExpenseMember,
            as: 'members',
            where: { userId },
            required: true,
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'name', 'email'],
          },
        ],
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['expenseDate', 'DESC']],
      });

      const total = await Expense.count({
        include: [
          {
            model: ExpenseMember,
            as: 'members',
            where: { userId },
            required: true,
          },
        ],
        where,
      });

      return res.status(200).json({
        data: expenses,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get expense by ID
   * GET /api/expenses/:expenseId
   */
  static async getExpenseById(req, res) {
    try {
      const { expenseId } = req.params;

      const expense = await Expense.findByPk(expenseId, {
        include: [
          {
            model: ExpenseMember,
            as: 'members',
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      return res.status(200).json({ data: expense });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Update an expense
   * PUT /api/expenses/:expenseId
   */
  static async updateExpense(req, res) {
    const t = await sequelize.transaction();
    try {
      const { expenseId } = req.params;
      const { name, amount, currency, description, category, expenseDate, members } = req.body;
      const userId = req.headers['x-user-id'] || req.userId;

      const expense = await Expense.findByPk(expenseId);
      if (!expense) {
        await t.rollback();
        return res.status(404).json({ message: 'Expense not found' });
      }

      if (expense.userId !== parseInt(userId)) {
        await t.rollback();
        return res.status(403).json({ message: 'You can only update your own expenses' });
      }

      // Update expense details
      if (name) expense.name = name;
      if (amount) expense.amount = amount;
      if (currency) expense.currency = currency;
      if (description) expense.description = description;
      if (category) expense.category = category;
      if (expenseDate) expense.expenseDate = expenseDate;

      await expense.save({ transaction: t });

      // Update members if provided
      if (members && members.length > 0) {
        await ExpenseMember.destroy({ where: { expenseId }, transaction: t });

        const expenseMembers = members.map(m => ({
          expenseId,
          userId: m.userId,
          shareAmount: m.shareAmount || parseFloat(amount) / members.length,
          shareType: m.shareType || 'equal',
        }));

        await ExpenseMember.bulkCreate(expenseMembers, { transaction: t });

        // Reset and recalculate balances
        await Balance.destroy({ 
          where: { 
            [Op.or]: [
              { userId: { [Op.in]: members.map(m => m.userId) } },
            ]
          },
          transaction: t 
        });

        await ExpenseController.updateBalances(expense, expenseMembers, t);
      }

      // Log activity
      await ActivityLog.create(
        {
          userId,
          expenseId,
          action: 'updated',
          actionDetails: { name, amount },
        },
        { transaction: t }
      );

      await t.commit();

      return res.status(200).json({ message: 'Expense updated successfully', data: expense });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Delete an expense
   * DELETE /api/expenses/:expenseId
   */
  static async deleteExpense(req, res) {
    const t = await sequelize.transaction();
    try {
      const { expenseId } = req.params;
      const userId = req.headers['x-user-id'] || req.userId;

      const expense = await Expense.findByPk(expenseId, { transaction: t });
      if (!expense) {
        await t.rollback();
        return res.status(404).json({ message: 'Expense not found' });
      }

      if (expense.userId !== parseInt(userId)) {
        await t.rollback();
        return res.status(403).json({ message: 'You can only delete your own expenses' });
      }

      // Get members before deletion to update balances
      const members = await ExpenseMember.findAll({
        where: { expenseId },
        transaction: t,
      });

      // Delete expense (soft delete)
      await expense.destroy({ transaction: t });

      // Reverse balance updates
      for (const member of members) {
        await Balance.decrement('amount', {
          by: member.shareAmount,
          where: {
            userId: expense.userId,
            targetUserId: member.userId,
          },
          transaction: t,
        });

        await Balance.increment('amount', {
          by: member.shareAmount,
          where: {
            userId: member.userId,
            targetUserId: expense.userId,
          },
          transaction: t,
        });
      }

      // Log activity
      await ActivityLog.create(
        {
          userId,
          expenseId,
          action: 'deleted',
          actionDetails: { expenseName: expense.name },
        },
        { transaction: t }
      );

      await t.commit();

      return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Helper function to update balances when an expense is created/updated
   */
  static async updateBalances(expense, expenseMembers, transaction) {
    for (const member of expenseMembers) {
      if (member.userId === expense.userId) continue; // Skip if user is paying for themselves

      // Debtor owes creditor
      const debtorOwesCreditor = await Balance.findOne({
        where: {
          userId: member.userId,
          targetUserId: expense.userId,
        },
        transaction,
      });

      if (debtorOwesCreditor) {
        debtorOwesCreditor.amount = parseFloat(debtorOwesCreditor.amount) + parseFloat(member.shareAmount);
        await debtorOwesCreditor.save({ transaction });
      } else {
        await Balance.create(
          {
            userId: member.userId,
            targetUserId: expense.userId,
            amount: member.shareAmount,
            currency: expense.currency,
          },
          { transaction }
        );
      }
    }
  }
}

module.exports = ExpenseController;
