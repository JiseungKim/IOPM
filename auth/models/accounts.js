const appsettings = require("../modules/config");
const mysql = require("mysql2/promise")
const uuid4 = require('uuid4')
const redis = require('redis')

class Accounts {
    constructor() {
        this.$pool = mysql.createPool(appsettings.database)
        this.$redis = redis.createClient(appsettings.redis)
        this.$round_robin_index = 0

        this.$redis_key = {
            host: (uuid) => `${uuid}:host`,
            pending: (uuid) => `${uuid}:pending`
        }

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
            const [rows] = await connection.query('SELECT uuid, host FROM user')
            for (let row of rows)
                this.$host(row.uuid, row.host)
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
            await this.$host(user.uuid, user.host)
            return { user: user, created: !empty }
        } catch (e) {
            await connection?.rollback()
        } finally {
            connection?.release()
        }
    }

    async endpoint(uuid) {
        const endpoints = appsettings.endpoints[await this.host(uuid)]
        return endpoints[Math.floor(Math.random() * endpoints.length)]
    }

    async $host(uuid, host) {
        return new Promise((resolve, reject) => {
            try {
                this.$redis.set(this.$redis_key.host(uuid), host, () => {
                    resolve(true)
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    async host(uuid) {
        return new Promise((resolve, reject) => {
            try {
                this.$redis.get(this.$redis_key.host(uuid), (error, value) => {
                    if (error)
                        reject(error)
                    else
                        resolve(value)
                })
            } catch (e) {
                reject(e)
            }
        })
    }
}

module.exports = new Accounts()