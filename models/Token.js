const Sequelize = require('sequelize');
const db = require('../database/db');

module.exports = db.sequelize.define(
  'tokens',
  {
    id: {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      autoIncrement: true
    },
    access_token: {
      type: Sequelize.STRING(255)
    },
    access_expired: {
      type: Sequelize.BIGINT(100)
    },
    provider: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.BIGINT
    },
    token_set_time: {
      type: Sequelize.BIGINT
    }
  },
  { 
    timestamps: false
  }
)