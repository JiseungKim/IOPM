
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')
// TODO: 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class Team {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }
    async find(tid) {

        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team WHERE id=${tid}`)

            if (rows.length == 0)
                return null

            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_all() {

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

    async find_by_owner(owner) {
        
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team WHERE owner=${owner}`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(team, member_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // TODO: 팀 이름 정규식
            // 자신이 만든 팀 이름 중복여부 검사
            const [rows] = await connection.query(`SELECT * FROM team WHERE name='${team.name}' AND owner=${member_id}`)

            if (rows.length > 0)
                return null

            const [result] = await connection.query(`INSERT INTO team(name,owner) VALUES('${team.name}',${member_id})`)

            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(mid, team) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // 팀 이름 중복 검사
            const [exists] = await connection.query(
                `SELECT COUNT(*) AS count FROM team
                WHERE NOT id=${team.id} AND name='${team.name}' AND owner=${mid}`
            )

            if (exists[0].count > 0)
                return false
            
            const [result] = await this._pool.query(`UPDATE team SET name='${team.name}',owner='${team.owner}' WHERE id=${team.id}`)

            return result.affectedRows > 0

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(id, mid) {

        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [result] = await connection.query(
                `DELETE FROM team WHERE id=${id} AND owner=${mid}`
            )

            return result.affectedRows > 0

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }


}

module.exports = Team