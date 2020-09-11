
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

            if(rows.length == 0)
                throw "팀이 없습니다."

            return rows
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

            if(rows.length == 0)
                throw "팀이 없습니다."

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
            
            if(rows.length == 0)
                throw "해당하는 팀이 없습니다."

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(team) {
        let connection = null
        try {
            connection = await this._pool.getConnection()
            // TODO: 팀 이름 정규식

            // 자신이 만든 팀 이름 중복여부 검사
            const [rows] = await connection.query(`SELECT * FROM team WHERE name='${team.name}' and owner=${team.owner}`)
            
            if(rows.length > 0)
                throw "팀이름이 중복됩니다."

            const [result] = await connection.query(`INSERT INTO team(name,owner) values('${team.name}',${team.owner})`)

            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async modify(mid, team) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // 권한 검사
            const [rows1] = await connection.query(`SELECT * FROM team WHERE id=${team.id}`)
            
            if(rows1.length == 0)
                throw "팀이 존재하지 않습니다."
            if(rows1[0].owner != mid)
                throw "권한이 없습니다."

            // 팀 이름 중복 검사
            const [rows2] = await connection.query(
                `SELECT * FROM team
                WHERE NOT id=${team.id} AND name='${team.name}' AND owner=${mid}`
            )

            if(rows2.length > 0)
                throw "팀 이름이 중복됩니다."

            await this._pool.query(`UPDATE team SET name='${team.name}',owner='${team.owner}' WHERE id=${team.id}`)

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(id, mid) {
        let connection = await this._pool.getConnection()
        
        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(
                `SELECT * FROM team WHERE id=${id} AND owner=${mid}`
            )

            if(rows.length == 0)
                throw "권한이 없습니다."
            
            const [result] = await connection.query(
                `DELETE FROM team WHERE id=${id}`
            )
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    
}

module.exports = Team