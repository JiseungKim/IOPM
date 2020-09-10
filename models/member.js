
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')
const sha256 = require('../modules/SHA256')

class Member {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }

    async check_email(email) {
        const connection = await this._pool.getConnection()
        
        try {
            const [row] = await connection.query(`SELECT * FROM member WHERE email='${email}'`)
            return row.length
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }

    }

    async check_nickname(nickname) {
        const connection = await this._pool.getConnection()

        try {
            const [rows] = await connection.query(`SELECT * FROM member WHERE nickname='${nickname}'`)
            return rows.length
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }

    }
    async update_last_login(mid) {
        const connection = await this._pool.getConnection()

        try {
            await connection.query(`UPDATE member SET last_login=now() WHERE id=${mid}`)
        } catch(err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async get(mid) {
        const connection = await this._pool.getConnection()

        try {
            const [rows] = await connection.query(`SELECT * FROM member WHERE id=${mid}`)
            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async get_all() {
        const connection = await this._pool.getConnection()

        try {
            const [rows] = await connection.query(`SELECT * FROM member`)
            return rows
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async insert(member) {
        const connection = await this._pool.getConnection()
        const code = sha256(member.password)

        try {
            const [result] = await connection.query(
                `INSERT INTO member(email,password,name,nickname,gender,phone,photo)
                VALUES('${member.email}','${code}','${member.name}','${member.nickname}','${member.gender}','${member.phone}','${member.photo}')`
            )
            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async update(member) {
        const connection = await this._pool.getConnection()

        try {
            await connection.query(
                `UPDATE member SET
                nickname='${member.nickname}',photo='${member.photo}',phone='${member.phone}'
                WHERE id=${member.id}`
            )

        } catch (err) {
            throw err
        } finally {
            connection.release()
        }

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

module.exports = Member