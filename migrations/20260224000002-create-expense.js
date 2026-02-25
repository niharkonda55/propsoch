'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD',
      },
      description: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      expenseDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      category: {
        type: Sequelize.STRING,
        defaultValue: 'Other',
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
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Expenses');
  },
};
