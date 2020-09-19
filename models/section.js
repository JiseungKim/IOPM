
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

    async find_by_project(project_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM section WHERE project_id=${project_id}`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(section, user_id, project_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // team의 관리자 찾기
            const [project_owner] = await connection.query(
                `SELECT owner FROM project WHERE id=${project_id}`
            )

            if (project_owner[0].owner != user_id)
                throw "관리자가 아닙니다."

            // TODO: 프로젝트 이름 정규식
            // 팀 내에 중복된 이름의 섹션 존재하는지 검사
            const [exists] = await connection.query(
                `SELECT * FROM section
                WHERE name='${section.name}' AND project_id=${project_id}`
            )

            if (exists.length > 0)
                return null

            const [result] = await connection.query(`INSERT INTO section(project_id,name) VALUES(${project_id},'${section.name}')`)

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

    async remove(section_id, user_id, project_id) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            // team의 관리자 찾기
            const [project_owner] = await connection.query(
                `SELECT owner FROM project WHERE id=${project_id}`
            )

            if (project_owner[0].owner != user_id)
                return null

            const [result] = await connection.query(
                `DELETE FROM section WHERE id=${section_id}`
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