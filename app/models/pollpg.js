const Poll = require('pg').Pool

const pool = new Poll({
    user: 'postgres',
    host: 'localhost',
    database: 'javaav',
    password: 'root',
    port: 5432,
})

module.exports = {
    pool
}
