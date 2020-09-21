
const mysql = require('mysql2/promise')
const settings = require('../modules/config')

// TODO: 정규식

class Project {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async find_by_id(section_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM section WHERE id=${section_id}`)

            if (rows.length == 0)
                return null

            return rows[0]
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async find_by_project(uuid, project_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            // 해당 유저의 프로젝트 참여 여부도 체크해야 하므로 JOIN 필요
            const [rows] = await connection.query(
                `
                SELECT section.id, section.name FROM section
                    LEFT JOIN user ON user.uuid='${uuid}'
                    LEFT JOIN project ON project.name='${project_id}'
                    LEFT JOIN participation ON participation.user_id=user.id AND participation.project_id=project.id
                WHERE participation.id IS NOT NULL
                ORDER BY section.created_date
                `
            )

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(name, uuid, project_name) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            const [[user]] = await connection.query(
                `SELECT id FROM user WHERE uuid='${uuid}' LIMIT 1`
            )
            if (user == null)
                throw `invalid user id : ${uuid}`

            const [[project]] = await connection.query(
                `SELECT * FROM project WHERE owner=${user.id} AND name='${project_name}' LIMIT 1`
            )
            if (project == null)
                throw `cannot find any matched project, name : '${project_name}'.`

            const [[exists]] = await connection.query(
                `SELECT COUNT(*) AS count FROM section WHERE project_id=${project.id} AND name='${name}'`
            )
            if (exists.count > 0)
                throw `'${name}' is already exists.`

            const [result] = await connection.query(
                `
                INSERT INTO section(project_id, name, created_date) 
                VALUES(${project.id}, '${name}', UTC_TIMESTAMP())
                `
            )
            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(section_id, section, user_id, project_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // team의 관리자 찾기
            const [project_owner] = await connection.query(
                `SELECT owner FROM project WHERE id=${project_id}`
            )

            if (project_owner[0].owner != user_id)
                throw "관리자가 아닙니다."

            // 섹션 이름 중복 검사
            const [exists] = await connection.query(
                `SELECT COUNT(*) AS count FROM section
                WHERE NOT id=${section_id} AND name='${section.name}' AND project_id=${project_id}`
            )

            if (exists[0].count > 0)
                return null

            const [result] = await this._pool.query(`UPDATE section SET name='${section.name}' WHERE id=${section_id}`)

            return result.affectedRows > 0

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(section_id, user_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()
            const [result] = await connection.query(
                `
                DELETE section FROM section
                    LEFT JOIN user ON user.uuid='${user_id}'
                    LEFT JOIN project ON project.id=section.project_id
                    LEFT JOIN participation ON participation.user_id=user.id AND participation.project_id=project.id
                WHERE 
                    section.id=${section_id} AND 
                    project.owner=user.id
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