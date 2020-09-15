
const mysql = require('mysql2/promise')
const settings = require('../config/appsettings.local.json')
const sha256 = require('../modules/SHA256')
// 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class Member {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async update_last_login(mid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            await connection.query(`UPDATE member SET last_login=now() WHERE id=${mid}`)

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find(mid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM member WHERE id=${mid}`)

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

            const [rows] = await connection.query(`SELECT * FROM member`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    assert(member, rows) {
        // TODO: 정규식!!
        const email_check = /([a-z0-9_\ .-]+)@([/da-z\ .-]+)\ .([a-z\ .]{2,6})/

        for(let row of rows) {
            if(row.email == member.email)
                throw "중복된 이메일입니다."
            if(row.nickname == member.nickname)
                throw "중복된 닉네임입니다."
            if(row.phone == member.phone)
                throw "중복된 핸드폰번호입니다."
        }
    }

    async add(member) {
        let connection = null
        const code = sha256(member.password)
        
        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(
                `SELECT * FROM member
                WHERE email='${member.email}' OR nickname='${member.nickname}'`
            )

            for(let row of rows) {
                if(row.email == member.email)
                    throw "중복된 이메일입니다."
                if(row.nickname == member.nickname)
                    throw "중복된 닉네임입니다."
            }

            const [result] = await connection.query(
                `INSERT INTO member(email,password,nickname,phone,photo)
                VALUES('${member.email}','${code}','${member.nickname}','${member.phone}','${member.photo}')`
            )
            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(member_id, member) {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            
            const [exists] = await connection.query(
                `SELECT COUNT(*) AS count FROM member
                WHERE NOT id='${member_id}' AND nickname='${member.nickname}'`
            )

            if (exists[0].count > 0)
                return null

            const [result] = await connection.query(
                `UPDATE member SET
                nickname='${member.nickname}',photo='${member.photo}',phone='${member.phone}'
                WHERE id=${member_id}`
            )

            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }

    }

    async remove(mid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [result] = await connection.query(`DELETE FROM member WHERE id=${mid}`)
            
            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }
    
}

module.exports = Member