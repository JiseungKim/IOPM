const mysql = require('mysql2/promise')
const config = require('../configs/configs.json').database
const pool = mysql.createPool(config)


function getConnection() {
    return pool.getConnection()
}

module.exports = getConnection