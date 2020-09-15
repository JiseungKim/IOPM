
const mysql = require('mysql2/promise')
const settings = require('../config/appsettings.local.json')

// TODO: 정규식

class Project {
    constructor() {
        this._pool = mysql.createPool(settings.database)
    }

    async find_by_id(pid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM project WHERE id=${pid}`)

            if (rows.length == 0)
                return null

            return rows[0]
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

            const [rows] = await connection.query(`SELECT * FROM project WHERE owner=${user_id}`)

            return rows
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
                `SELECT * FROM project
                JOIN (SELECT project_id FROM participation WHERE user_id=${user_id}) as PTCP
                ON project.id = PTCP.project_id;`
            )

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(project, user_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // TODO: 프로젝트 이름 정규식
            // 자신이 만든 프로젝트에 중복된 팀 이름이 있는지 검사
            const [exists] = await connection.query(
                `SELECT COUNT(*) AS count FROM project
                WHERE name='${project.name}' AND owner=${user_id}`
            )

            if (exists[0].count > 0)
                return null

            const [result] = await connection.query(
                `INSERT INTO project(name,owner) VALUES('${project.name}', ${user_id})`
            )

            return result.insertId
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

            // project의 관리자 찾기
            const [project_owner] = await connection.query(
                `SELECT owner FROM project WHERE id=${project_id}`
            )
            
            if(project_owner[0].owner != user_id)
                throw "관리자가 아닙니다."

            const [exists] = await connection.query(
                `SELECT COUNT(*) AS count FROM project
                WHERE NOT id=${project_id} AND owner=${user_id} AND name='${project.name}'`
            )

            if (exists[0].count > 0)
                return null
            
            const [result] = await this._pool.query(
                `UPDATE project SET name='${project.name}' WHERE id=${project_id}`
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

            // team의 관리자 찾기
            const [project_owner] = await connection.query(
                `SELECT owner FROM project WHERE id=${project_id}`
            )
            
            if(project_owner[0].owner != user_id)
                throw "관리자가 아닙니다."

            const [result] = await connection.query(
                `DELETE FROM project WHERE id=${project_id}`
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