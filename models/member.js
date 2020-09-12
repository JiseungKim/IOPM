
const mysql = require('mysql2/promise')
const config = require('../modules/config')
const sha256 = require('../modules/SHA256')
// 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class Member {
    constructor() {
        this._pool = mysql.createPool(config.database)
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

    // team 모델과 마찬가지로 수정하세요
    async find(mid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member WHERE id=${mid}`)

            if (rows.length == 0)
                throw "없는 사용자입니다."

            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    // team 모델과 마찬가지로 수정하세요
    async find_all() {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(`SELECT * FROM member`)

            if (rows.length == 0)
                throw "사용자가 없습니다."

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    // 이렇게 검증중에 throw만 날리는 걸 assert라고 해요
    // 메소드 이름을 assert로 바꾸면 좋겠네요
    check_duplication(member, rows) {
        // TODO: 정규식!!
        // camel 쓰지말라고
        const emailCheck = /([a-z0-9_\ .-]+)@([/da-z\ .-]+)\ .([a-z\ .]{2,6})/

        for (let row of rows) {
            if (row.email == member.email)
                throw "중복된 이메일입니다."
            if (row.nickname == member.nickname)
                throw "중복된 닉네임입니다."
            if (row.phone == member.phone)
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
                WHERE email='${member.email}' OR nickname='${member.nickname}' OR phone='${member.phone}'`
            )

            for (let row of rows) {
                if (row.email == member.email)
                    throw "중복된 이메일입니다."
                if (row.nickname == member.nickname)
                    throw "중복된 닉네임입니다."
                if (row.phone == member.phone)
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
            connection?.release()
        }
    }

    // modify > update
    async modify(member) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(
                `SELECT * FROM member
                WHERE email!='${member.email}' AND (nickname='${member.nickname}' OR phone='${member.phone}')`
            )

            for (let row of rows) {
                if (row.nickname == member.nickname)
                    throw "중복된 닉네임입니다."
                if (row.phone == member.phone)
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
            connection?.release()
        }

    }

    async remove(mid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            await connection.query(`DELETE FROM member WHERE id=${mid}`)
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

}

module.exports = Member