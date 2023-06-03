const {prepareValue} = require("pg/lib/utils");
require('dotenv').config()
const Poll = require('pg').Pool

const pool = new Poll({
    user: process.env.PG_USER_NAME,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_USER_PASSWORD,
    port: process.env.PG_PORT,
})

module.exports = {
    pool
}
