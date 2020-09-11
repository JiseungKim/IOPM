
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')
const sha256 = require('../modules/SHA256')
// 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class Member {
    constructor() {
        this._pool = mysql.createPool(config.database)
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

    async find(mid) {
        const connection = await this._pool.getConnection()

        try {
            const [rows] = await connection.query(`SELECT * FROM member WHERE id=${mid}`)

            if(rows.length == 0)
                throw "없는 사용자입니다."

            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    async find_all() {
        const connection = await this._pool.getConnection()

        try {
            const [rows] = await connection.query(`SELECT * FROM member`)

            if(rows.length == 0)
                throw "사용자가 없습니다."

            return rows
        } catch (err) {
            throw err
        } finally {
            connection.release()
        }
    }

    check_duplication(member, rows) {
        // TODO: 정규식!!
        const emailCheck = /([a-z0-9_\ .-]+)@([/da-z\ .-]+)\ .([a-z\ .]{2,6})/

        for(var i = 0; i < rows.length; i++) {
            if(rows[i].email == member.email)
                throw "중복된 이메일입니다."
            if(rows[i].nickname == member.nickname)
                throw "중복된 닉네임입니다."
            if(rows[i].phone == member.phone)
                throw "중복된 핸드폰번호입니다."
        }
    }

    async add(member) {
        const connection = await this._pool.getConnection()
        const code = sha256(member.password)
        
        try {
            const [rows] = await connection.query(
                `SELECT * FROM member
                WHERE email='${member.email}' OR nickname='${member.nickname}' OR phone='${member.phone}'`
            )

            for(var i = 0; i < rows.length; i++) {
                if(rows[i].email == member.email)
                    throw "중복된 이메일입니다."
                if(rows[i].nickname == member.nickname)
                    throw "중복된 닉네임입니다."
                if(rows[i].phone == member.phone)
                    throw "중복된 핸드폰번호입니다."
            }

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

    async modify(member) {
        const connection = await this._pool.getConnection()

        try {
            const [rows] = await connection.query(
                `SELECT * FROM member
                WHERE email!='${member.email}' AND (nickname='${member.nickname}' OR phone='${member.phone}')`
            )

            for(var i = 0; i < rows.length; i++) {
                if(rows[i].nickname == member.nickname)
                    throw "중복된 닉네임입니다."
                if(rows[i].phone == member.phone)
                    throw "중복된 핸드폰번호입니다."
            }

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