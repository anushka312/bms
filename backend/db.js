const Pool = require('pg').Pool; // A pool is a group of reusable database connections (resource saving)

const pool = new Pool({
    user: "postgres",
    password: "Jendeukie48@",
    host: "localhost",
    port: 5432,
    database: "bms"
});

module.exports = pool;