
const mysql = require('mysql2/promise')
const settings = require('../config/appsettings.local.json')
const Team = require('./team')

const team = new Team()

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

    async find_by_team(tid) {
        let connection = null

        try {
            connection = await this._pool.getConnection()

            const [rows] = await connection.query(`SELECT * FROM project WHERE team_id=${tid}`)

            return rows
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async add(project, member_id, team_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // team의 관리자 찾기
            const [team_owner] = await connection.query(
                `SELECT owner, team_id FROM project AS p
                JOIN team ON p.team_id=team.id
                WHERE p.id=${project_id}`
            )
            
            if(team_owner[0].owner != member_id)
                throw "관리자가 아닙니다."

            // TODO: 프로젝트 이름 정규식
            // 팀 내에 중복된 이름의 프로젝트가 존재하는지 검사
            const [exists] = await connection.query(
                `SELECT * FROM project
                WHERE name='${project.name}' AND team_id=${team_id}`
            )

            if (exists.length > 0)
                return null

            const [result] = await connection.query(`INSERT INTO project(team_id,name) VALUES(${team_id},'${project.name}')`)

            return result.insertId
        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async update(project, member_id, project_id) {
        let connection = null
        try {
            connection = await this._pool.getConnection()

            // team의 관리자 찾기
            const [team_owner] = await connection.query(
                `SELECT owner, team_id FROM project AS p
                JOIN team ON p.team_id=team.id
                WHERE p.id=${project_id}`
            )
            
            if(team_owner[0].owner != member_id)
                throw "관리자가 아닙니다."

            // 프로젝트 이름 중복 검사
            const [exists] = await connection.query(
                `SELECT COUNT(*) AS count FROM project
                WHERE NOT id=${project_id} AND name='${project.name}' AND team_id=${team_owner[0].team_id}`
            )

            if (exists[0].count > 0)
                return null
            
            const [result] = await this._pool.query(`UPDATE project SET name='${project.name}' WHERE id=${project_id}`)

            return result.affectedRows > 0

        } catch (err) {
            throw err
        } finally {
            connection?.release()
        }
    }

    async remove(project_id, member_id) {
        console.log("삭제")
        let connection = null

        try {
            connection = await this._pool.getConnection()

            // team의 관리자 찾기
            const [team_owner] = await connection.query(
                `SELECT owner, team_id FROM project AS p
                JOIN team ON p.team_id=team.id
                WHERE p.id=${project_id}`
            )
            
            if(team_owner[0].owner != member_id)
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