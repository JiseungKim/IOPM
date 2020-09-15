
const mysql = require('mysql2/promise')
const settings = require('../config/appsettings.local.json')

// TODO: 정규식

class Todo {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async find_by_id(tid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM todo WHERE id=${tid}`)

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

            const [rows] = await connection.query(`SELECT * FROM todo WHERE section_id=${sid}`)

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

            const [rows] = await connection.query(`SELECT * FROM todo WHERE project_id=${pid}`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(todo) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // TODO: deadline 컬럼 추가
            const [result] = await connection.query(
                `INSERT INTO todo(title, description, team_id, section_id, project_id, owner, importance) 
                VALUES('${todo.title}', '${todo.desc}', ${todo.team_id}, ${todo.section_id}, ${todo.project_id}, ${todo.owner}, ${todo.importance})`
            )

            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(todo, todo_id, member_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // todo의 관리자 찾기
            const [todo_owner] = await connection.query(`SELECT owner FROM todo WHERE id=${todo_id}`)
            
            if(todo_owner[0].owner != member_id)
                return null
            
            // TODO: deadline 컬럼 추가
            const [result] = await this._pool.query(
                `UPDATE todo
                SET title='${todo.title}', description='${todo.desc}', importance=${todo.importance}
                WHERE id=${todo_id}`
            )

            return result.affectedRows > 0

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(todo_id, member_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            // todo의 관리자 찾기
            const [todo_owner] = await connection.query(`SELECT owner FROM todo WHERE id=${todo_id}`)
            
            if(todo_owner[0].owner != member_id)
                return null

            const [result] = await connection.query(
                `DELETE FROM todo WHERE id=${todo_id}`
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