const appsettings = require("../modules/config");
const mysql = require("mysql2/promise")
const uuid4 = require('uuid4')

class Accounts {
    constructor() {
        this.$pool = mysql.createPool(appsettings.database)
        this.$cache = {}
        this.$round_robin_index = 0

        this.$init()
    }

    $next_host() {
        const host_name_list = Object.keys(appsettings.endpoints)
        const endpoint = host_name_list[this.$round_robin_index]
        this.$round_robin_index = (this.$round_robin_index + 1) % host_name_list.length
        return endpoint
    }

    async $init() {
        let connection = null
        try {
            connection = await this.$pool.getConnection()
            const [rows] = connection.query('SELECT uuid FROM user')
            this.$cache = rows.map(x => x.uuid)
        } catch (e) {

        } finally {
            connection?.release()
        }
    }

    async get(f_uid, parameters) {
        parameters = parameters || {}

        let connection = null
        try {
            connection = await this.$pool.getConnection()
            connection.beginTransaction()
            let [[user]] = await connection.query(`SELECT * FROM user WHERE firebase_uid = '${f_uid}'`)
            const empty = (user == null)
            if (empty) {
                user = Object.assign(parameters, { uuid: uuid4(), host: this.$next_host() })
                connection.query(
                    `
                INSERT INTO user(uuid, host, firebase_uid, email, nickname, photo, last_login, created_date)
                VALUES('${user.uuid}', '${user.host}', '${f_uid}', '${user.email}', '${user.name}', '${user.photo}', UTC_TIMESTAMP(), UTC_TIMESTAMP())
                `
                )
            }
            await connection.commit()
            this.$cache[user.uuid] = user
            return { user: user, created: !empty }
        } catch (e) {
            await connection?.rollback()
        } finally {
            connection?.release()
        }
    }

    async endpoint(uuid) {
        return new Promise((resolve, reject) => {
            try {
                const host = this.$cache[uuid].host
                const endpoints = appsettings.endpoints[host]
                const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
                resolve(endpoint)
            } catch (e) {
                reject(e)
            }
        })
    }
}

module.exports = new Accounts()