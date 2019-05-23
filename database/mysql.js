const mysql = require('mysql');

const pool = mysql.createPool({
  host: '52.193.1.88',
  // port: '8889',
  user: 'root',
  password: 'A19s96asdsaf1012a',
  database: 'stylishs'
});
// conn.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
// conn.connect();
module.exports = pool;
