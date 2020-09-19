
const mysql = require('mysql2/promise')
const settings = require('../modules/config')

// TODO: 정규식

class Todo {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async find_by_id(tid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM todo WHERE id=${tid} AND deleted=0`)

            if (rows.length == 0)
                return null

            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_by_section(sid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM todo WHERE section_id=${sid} AND deleted=0`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_by_project(pid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM todo WHERE project_id=${pid} AND deleted=0`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(todo, user_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // 프로젝트 참여 검사
            const [project_user] = await this._pool.query(`SELECT * FROM participation WHERE project_id=${todo.project_id} AND user_id=${user_id}`)

            if (project_user.length == 0)
                return null

            // TODO: deadline 컬럼 추가
            const [result] = await connection.query(
                `INSERT INTO todo(title, description, section_id, project_id, owner, importance, deadline) 
                VALUES('${todo.title}', '${todo.desc}', ${todo.section_id}, ${todo.project_id}, ${todo.owner}, ${todo.importance}, ${todo.deadline})`
            )

            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(todo, todo_id, user_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // TODO: deadline 컬럼 추가
            const [result] = await this._pool.query(
                `UPDATE todo
                SET title='${todo.title}', description='${todo.desc}', importance=${todo.importance}, deadline=${todo.deadline}
                WHERE id=${todo_id} AND owner=${user_id} AND deleted=0`
            )

            return result.affectedRows > 0

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(todo_id, user_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [result] = await connection.query(
                `UPDATE todo SET deleted=1 WHERE id=${todo_id} AND owner=${user_id} AND deleted=0`
            )
            return result.affectedRows > 0
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

}

module.exports = Todo