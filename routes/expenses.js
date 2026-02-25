const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');
const { userIdMiddleware, validateExpenseCreation } = require('../middleware/validation');

/**
 * Expense Routes
 */

// Create expense
router.post('/', userIdMiddleware, validateExpenseCreation(), ExpenseController.createExpense);

// Get all expenses for user
router.get('/', userIdMiddleware, ExpenseController.getExpenses);

// Get specific expense
router.get('/:expenseId', userIdMiddleware, ExpenseController.getExpenseById);

// Update expense
router.put('/:expenseId', userIdMiddleware, ExpenseController.updateExpense);

// Delete expense
router.delete('/:expenseId', userIdMiddleware, ExpenseController.deleteExpense);

module.exports = router;
