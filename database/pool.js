const mysql = require('mysql2');

const pool = mysql.createPool({
    // host: '사용자 입력',  ex) host: 'localhost',
    // port: '사용자 입력',  ex) port: '3306',
    // user: '사용자 입력',  ex) user: 'root',
    // password: '사용자 입력', ex) password: '1234',
    // database: '사용자 입력'  ex) database: 'livestock'
})

module.exports = pool.promise();
