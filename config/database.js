require('dotenv').config();

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
  },
};
