
const mysql = require('mysql2/promise')
const settings = require('../config/appsettings.local.json')

class Participation {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async get_all() {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(participation) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(
                `SELECT * FROM participation WHERE team_id=${participation.team_id} AND member_id=${participation.member_id}`
            )

            if(rows.length > 0)
                return null
            
            const [result] = await connection.query(
                `INSERT INTO participation(team_id,member_id) VALUES(${participation.team_id}, ${participation.member_id})`
            )
            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(participation) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [result] = await connection.query(
                `DELETE FROM participation WHERE member_id=${participation.member_id} AND team_id=${participation.team_id}`
            )

            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }
    
}

module.exports = Participation