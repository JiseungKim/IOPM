
const mysql = require('mysql2/promise')
const config = require('../modules/config')

class Participation {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }

    async get_all() {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team`)

            if (rows.length == 0)
                throw "팀이 없습니다."

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

            if (rows.length > 0)
                throw "이미 가입되어있는 멤버입니다."

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

    async remove(id, mid) {
        let connection = await this._pool.getConnection()
        // TODO:
    }

}

module.exports = Participation