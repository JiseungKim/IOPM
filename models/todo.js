
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
            const [[result]] = await connection.query(
                `
                SELECT
                    project.owner=user.id AS mine
                FROM project
                    LEFT JOIN user ON user.uuid='${uuid}'
                    LEFT JOIN participation ON participation.project_id=project.id AND participation.user_id=user.id
                WHERE                 
                    project.name='${pname}'
                LIMIT 1
                `
            )
            if (result == null)
                throw 'not participated.'

            const mine = !!result.mine

            const [rows] = await connection.query(
                `
                SELECT 
                    project.id AS pid,
                    section.id AS sid, section.name AS name,
                    todo.id AS tid, todo.title, todo.description, todo.importance, todo.deadline,
                    user.photo, user.email,
                    user.uuid='${uuid}' AS mine
                FROM section
                    JOIN user
                    LEFT JOIN todo ON todo.section_id=section.id AND todo.owner=user.id
                    LEFT JOIN project ON project.id=section.project_id AND project.name='${pname}'
                    LEFT JOIN participation ON participation.project_id=project.id AND participation.user_id=user.id
                WHERE
                    participation.id IS NOT NULL AND
                    (todo.deleted=0 OR todo.deleted IS NULL)
                GROUP BY todo.id
                ORDER BY section.created_date, todo.created_date
                `
            )

            const hash = {}
            for (const x of new Set(rows.map(x => `${x.sid}:${x.name}`)))
                hash[x] = []

            for (const row of rows.filter(x => x.title != null))
                hash[`${row.sid}:${row.name}`].push(row)

            const sections = Object.entries(hash).map(([key, value]) => {
                const [id, name] = key.split(':')
                return {
                    id: id,
                    name: name,
                    todo_list: value
                }
            })

            return {
                mine: mine,
                sections: sections
            }
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
                `
                DELETE todo FROM todo
                    LEFT JOIN user ON user.uuid='${user_id}'
                    LEFT JOIN section ON section.id=todo.section_id
                    LEFT JOIN project ON project.id=section.project_id
                    LEFT JOIN participation ON participation.user_id=user.id AND participation.project_id=project.id
                WHERE 
                    todo.id=${todo_id} AND todo.owner=user.id;
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

module.exports = Todo