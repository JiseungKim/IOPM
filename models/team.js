
const mysql = require('mysql2/promise')
const config = require('../configs/configs.json')
// TODO: 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class Team {
    constructor() {
        this._pool = mysql.createPool(config.database)
    }
    async find(tid) {
        // 예외 대신 성공 vs 실패로 구분하세요
        let connection = null
        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team WHERE id=${tid}`)

            if (rows.length == 0)
                throw "팀이 없습니다."

            // 배열형식으로 리턴하지 마요
            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_all() {
        // 빈 리스트 리턴해도 괜찮아요
        let connection = null
        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team`)

            // 예외 던지지 마요
            if (rows.length == 0)
                throw "팀이 없습니다."

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_by_owner(owner) {
        // 예외 대신 성공 vs 실패로 구분하세요
        let connection = null
        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM team WHERE owner=${owner}`)

            if (rows.length == 0)
                throw "해당하는 팀이 없습니다."

            // 배열형식으로 리턴하지 마요
            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    // 좀 더 명확히 하기 위해서 만드는 사람 정보를 team.owner에 넣지 말고
    // 파라미터를 [team정보, member id] 이렇게 2개 받는 게 더 좋겠네요
    async add(team) {
        // 예외 대신 성공 vs 실패로 구분하세요
        let connection = null
        try {
            connection = await this._pool.getConnection()
            // TODO: 팀 이름 정규식

            // 자신이 만든 팀 이름 중복여부 검사
            // SELECT / FROM / WHERE / and << 얘는 왜 소문자임
            const [rows] = await connection.query(`SELECT * FROM team WHERE name='${team.name}' and owner=${team.owner}`)

            if (rows.length > 0)
                throw "팀이름이 중복됩니다."

            const [result] = await connection.query(`INSERT INTO team(name,owner) values('${team.name}',${team.owner})`)

            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    // modify : 있으면 수정하고 없으면 create
    // update : 있으면 수정하고 없으면 아무것도 안함
    // >> update가 맞음
    async modify(mid, team) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // 권한 검사
            // 이 부분을 빼고 일단 무조건 있다고 생각하세요.
            const [rows1] = await connection.query(`SELECT * FROM team WHERE id=${team.id}`)

            if (rows1.length == 0)
                throw "팀이 존재하지 않습니다."
            if (rows1[0].owner != mid)
                throw "권한이 없습니다."

            // 팀 이름 중복 검사
            // SELECT * 대신 COUNT(*), row1 row2 이런식으로 이름짓지 말고 exists 이런걸로 해요
            const [rows2] = await connection.query(
                `SELECT * FROM team
                WHERE NOT id=${team.id} AND name='${team.name}' AND owner=${mid}`
            )

            if (rows2.length > 0)
                throw "팀 이름이 중복됩니다."

            // UPDATE 쿼리 날리면 affected rows 이런거 얻을 수 있을텐데 한번 찾아보고
            // 이 쿼리를 통해서 변경된 값이 1개면 변경성공, 0개면 팀이 없다고 판단하세요. 그럼 위에서 SELECT 안해도 되겠죠?
            await this._pool.query(`UPDATE team SET name='${team.name}',owner='${team.owner}' WHERE id=${team.id}`)

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(id, mid) {
        // 예외 대신 성공 vs 실패로 구분하세요

        let connection = await this._pool.getConnection()   // 이건 뭐하자는거지

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(
                `SELECT * FROM team WHERE id=${id} AND owner=${mid}`
            )

            if (rows.length == 0)
                throw "권한이 없습니다."

            // 이것도 affected rows로 성공했는지 실패했는지 판단하세요.
            // Ex) DELETE FROM team WHERE id=${id} AND owner=${mid} >> return affected rows > 0
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