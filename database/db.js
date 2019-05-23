const Sequelize = require('sequelize');
const db = {};
const sequelize = new Sequelize('stylishs', 'root', 'A19s96asdsaf1012a', {
  host: '52.193.1.88',
  //  port: '8889',
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
