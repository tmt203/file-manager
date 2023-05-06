const mysql = require('mysql');

// EXPORT DATABASE CONFIG
module.exports = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});