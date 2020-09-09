
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')
const sha256 = require('../modules/SHA256')

class Member {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }

    async update_last_login(mid) {
        const connection = await this._pool.getConnection()
        try {
            await connection.query(`UPDATE member SET last_login=now() WHERE id=${mid}`)
        } catch(err) {
            connection.rollback()
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
            console.log(err)
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
            console.log(err)
        } finally {
            connection.release()
        }
    }

    async insert(member) {
        const connection = await this._pool.getConnection()
        const code = sha256(member.password)
        try {
            await connection.query(
                `INSERT INTO member(email,password,name,nickname,gender,phone,photo)
                VALUES('${member.email}','${code}','${member.name}','${member.nickname}','${member.gender}','${member.phone}','${member.photo}')`
            )
        } catch (err) {
            console.log(err)
            connection.rollback()
        } finally {
            connection.release()
        }
    }

    async update(member) {
        const connection = await this._pool.getConnection()

        try {
            await connection.query(
                `UPDATE member SET
                email='${member.password}',nickname='${member.nickname}',phone='${member.phone}',photo='${member.photo}'
                WHERE id=${member.id}`
            )
        } catch (err) {
            connection.rollback()
        } finally {
            connection.release()
        }

    }

    async delete(mid) {
        const connection = await this._pool.getconnection()
        try {
            await connection.query(`DELETE FROM member WHERE id=${mid}`)
        } catch (err) {
            connection.rollback()
        } finally {
            connection.release()
        }
    }
    
}

module.exports = Member