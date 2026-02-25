'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        email: 'alice@example.com',
        password: '$2a$10$example_hash_alice', // bcrypt hash of 'password123'
        name: 'Alice Johnson',
        currency: 'USD',
        profilePicture: null,
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 2,
        email: 'bob@example.com',
        password: '$2a$10$example_hash_bob',
        name: 'Bob Smith',
        currency: 'USD',
        profilePicture: null,
        phone: '+0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 3,
        email: 'charlie@example.com',
        password: '$2a$10$example_hash_charlie',
        name: 'Charlie Brown',
        currency: 'USD',
        profilePicture: null,
        phone: '+1122334455',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
