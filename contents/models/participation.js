
const mysql = require('mysql2/promise')
const settings = require('../modules/config')

class Participation {
    constructor() {
        this.$pool = mysql.createPool(settings.database)
    }

    async get_all() {
        let connection = null

        try {
            connection = await this.$pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team`)

            return rows
        } catch (err) {
            throw err
        } finally {
            if (connection != null)
                connection.release()
        }
    }

    async add(participation) {
        let connection = null
        try {
            connection = await this.$pool.getConnection()

            const [rows] = await connection.query(
                `SELECT * FROM participation WHERE project_id=${participation.project_id} AND user_id=${participation.user_id}`
            )

            if (rows.length > 0)
                return null

            const [result] = await connection.query(
                `INSERT INTO participation(project_id,user_id) VALUES(${participation.project_id}, ${participation.user_id})`
            )
            return result.insertId
        } catch (err) {
            throw err
        } finally {
            if (connection != null)
                connection.release()
        }
    }

    async remove(participation) {
        let connection = null

        try {
            connection = await this.$pool.getConnection()

            const [result] = await connection.query(
                `DELETE FROM participation WHERE user_id=${participation.user_id} AND project_id=${participation.project_id}`
            )

            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            if (connection != null)
                connection.release()
        }
    }

}

module.exports = Participation