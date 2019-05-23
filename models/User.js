const Sequelize = require('sequelize');
const db = require('../database/db');

module.exports = db.sequelize.define(
  'users',
  {
    id: {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      autoIncrement: true
    },
    provider: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    picture: {
      type: Sequelize.STRING
    }
  },
  { 
    timestamps: false
  }
)