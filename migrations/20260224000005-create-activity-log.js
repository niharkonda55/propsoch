'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
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
      expenseId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Expenses',
          key: 'id',
        },
      },
      action: {
        type: Sequelize.ENUM('created', 'updated', 'deleted', 'added_member'),
        allowNull: false,
      },
      actionDetails: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  },
};
