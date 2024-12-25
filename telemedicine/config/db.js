// Inside db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();




// Create a pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tele-medic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



// Export the pool
module.exports = pool.promise();
