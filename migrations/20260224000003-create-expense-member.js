'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ExpenseMembers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      expenseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Expenses',
          key: 'id',
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      shareAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      shareType: {
        type: Sequelize.ENUM('equal', 'percentage', 'amount'),
        defaultValue: 'equal',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ExpenseMembers');
  },
};
