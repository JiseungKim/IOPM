
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')

class Team {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }

    async remove(mid) {
        const connection = await this._pool.getConnection()

        try {
            await connection.query(`DELETE FROM member WHERE id=${mid}`)
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }
}

module.exports = Team