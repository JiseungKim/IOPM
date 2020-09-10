
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')
const sha256 = require('../modules/SHA256')

class Member {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }

    async check_email(email) {
        const connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member WHERE email='${email}'`)
            return rows.length
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async check_nickname(nickname) {
        const connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member WHERE nickname='${nickname}'`)
            return rows.length
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }

    }
    

    async get(mid) {
        const connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member WHERE id=${mid}`)
            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async get_all() {
        const connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member`)
            return rows
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async insert(member) {
        const code = sha26(member.password)
        const connection = null

        try {
            connection = await this._pool.getConnection()
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
        const connection = null

        try {
            connection = await this._pool.getConnection()
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
        const connection = null

        try {
            connection = await this._pool.getConnection()
            await connection.query(`DELETE FROM member WHERE id=${mid}`)
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }
    
    async update_last_login(member) {
        const code = sha256(member.pssword)
        const connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member WHERE email='${member.email}' and '${code}`)
            if(rows.length > 0) {
                connection.query(`UPDATE member SET last_login=now() WHERE id=${mid}`)
            }
            return member.email
        } catch(err) {
            throw err
        } finally {
            connection.release()
        }
    }
}

module.exports = Member