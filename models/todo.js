
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

    async find_by_project(uuid, pname) {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            const [rows] = await connection.query(
                `
                SELECT
                    section.id AS id, section.name AS name,
                    todo.title, todo.description, todo.importance, todo.deadline
                FROM section
                    LEFT JOIN user ON user.uuid='${uuid}'
                    LEFT JOIN participation ON user.id=participation.user_id
                    LEFT JOIN project ON project.id=section.project_id AND project.id=participation.project_id AND project.name='${pname}'
                    LEFT JOIN todo ON todo.section_id=section.id
                WHERE 
                    project.id IS NOT NULL AND
                    participation.id IS NOT NULL AND
                    (todo.deleted=0 OR todo.deleted IS NULL)
                ORDER BY section.created_date
                `
            )

            const hash = {}
            for (const x of new Set(rows.map(x => `${x.id}:${x.name}`)))
                hash[x] = []

            for (const row of rows.filter(x => x.title != null))
                hash[`${row.id}:${row.name}`].push(row)

            return Object.entries(hash).map(([key, value]) => {
                const [id, name] = key.split(':')
                return {
                    id: id,
                    name: name,
                    todo_list: value
                }
            })
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(user_id, section_id, title, desc) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // 프로젝트 참여 검사
            // const [project_user] = await this._pool.query(`SELECT * FROM participation WHERE project_id=${todo.project_id} AND user_id=${user_id}`)
            const [[exists]] = await connection.query(
                `
                SELECT user.id AS uid FROM participation
                    LEFT JOIN user ON user.uuid='${user_id}' AND user.id=participation.user_id
                    LEFT JOIN project ON project.id=participation.project_id
                    LEFT JOIN section ON section.project_id=project.id AND section.id=${section_id}
                WHERE 
                    user.id IS NOT NULL AND
                    section.id IS NOT NULL AND
                    project.id IS NOT NULL;
                `
            )
            if (exists == null)
                return null

            // TODO: deadline 컬럼 추가
            const [result] = await connection.query(
                `
                INSERT INTO todo(title, description, section_id, owner, created_date, importance, deadline)
                VALUES('${title}', '${desc}', ${section_id}, ${exists.uid}, UTC_TIMESTAMP(), 0, UTC_TIMESTAMP())
                `
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