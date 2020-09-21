
const mysql = require('mysql2/promise')
const settings = require('../modules/config')

// TODO: 정규식

class Project {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async find_by_id(pid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [[row]] = await connection.query(`SELECT * FROM project WHERE id=${pid}`)
            return row
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_by_owner(user_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [[row]] = await connection.query(`SELECT * FROM project WHERE owner='${user_id}'`)
            return row
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_by_user(user_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(
                `
                SELECT 
                    project.id, project.name, project.desc, 
                    project.owner=user.id AS mine
                FROM project
                    LEFT JOIN user ON user.uuid='${user_id}'
                    LEFT JOIN participation ON participation.user_id=user.id AND participation.project_id=project.id
                WHERE participation.id IS NOT NULL;
                `
            )

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(name, desc, user_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // TODO: 프로젝트 이름 정규식
            // 자신이 만든 프로젝트에 중복된 팀 이름이 있는지 검사
            const [[exists]] = await connection.query(
                `SELECT COUNT(*) AS count FROM project
                WHERE name='${name}' AND owner='${user_id}'`
            )

            if (exists.count > 0)
                return null

            const [[user]] = await connection.query(
                `SELECT id FROM user WHERE uuid='${user_id}' LIMIT 1`
            )

            const [result] = await connection.query(
                `INSERT INTO project(name, \`desc\`, owner, created_date) VALUES('${name}', '${desc}', ${user.id}, UTC_TIMESTAMP())`
            )

            await connection.query(
                `INSERT INTO participation(project_id, user_id) VALUES(${result.insertId}, ${user.id})`
            )

            return {
                id: result.insertId,
                name: name,
                desc: desc
            }
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(project, user_id, project_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            const [result] = await this._pool.query(
                `UPDATE project SET name=${project.name} WHERE id=${project_id} AND owner='${user_id}'`
            )

            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(project_id, user_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            const [result] = await connection.query(
                `
                DELETE P FROM project as P
                    LEFT JOIN user ON user.uuid='${user_id}' AND p.owner=user.id
                WHERE
                    p.id=${project_id} AND
                    user.id IS NOT NULL
                `
            )

            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

}

module.exports = Project