const appsettings = require("../modules/config")
const redis = require('redis')
const { users, sequelize } = require('./context')

class Accounts {
    constructor() {
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
        try {
            const rows = await users.findAll()
            for (let row of rows)
                this.$host(row.uuid, row.host)
        } catch (e) {
            console.error(e)
        }
    }

    async get(uuid, parameters) {
        parameters = parameters || {}

        const t = await sequelize.transaction()
        try {

            let user = await users.findOne({ where: { uuid: uuid } })
            const empty = (user == null)
            if (empty) {
                user = await users.create({
                    uuid: uuid,
                    host: this.$next_host(),
                    email: parameters.email,
                    nickname: parameters.name,
                    photo: parameters.photo
                }, { transaction: t })
            }
            await t.commit()
            await this.$host(user.id, user.host)
            return { user: user, created: empty }
        } catch (e) {
            console.error(e)
            t.rollback()
            return { user: null, created: false }
        }
    }

    async endpoint(id) {
        const endpoints = appsettings.endpoints[await this.host(id)]
        return endpoints[Math.floor(Math.random() * endpoints.length)]
    }

    async $host(id, host) {
        return new Promise((resolve, reject) => {
            try {
                this.$redis.set(this.$redis_key.host(id), host, () => {
                    resolve(true)
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    async host(id) {
        return new Promise((resolve, reject) => {
            try {
                this.$redis.get(this.$redis_key.host(id), (error, value) => {
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