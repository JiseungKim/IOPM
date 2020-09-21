const appsettings = require("../modules/config");
const mysql = require("mysql2/promise")
const jwt = require("jsonwebtoken")
const admin = require("firebase-admin")
const uuid4 = require('uuid4')

class Authenticator {
    constructor() {
        this._pool = mysql.createPool(appsettings.database)
        this._cache = []

        let connection = null
        this._pool.getConnection()
            .then(x => {
                connection = x
                return x.query(`SELECT uuid FROM user`)
            })
            .then(x => {
                const [rows] = x
                this._cache = rows.map(x => x.uuid)
            })
            .then(() => {
                connection?.release()
            })
    }

    async issue(uuid, time) {

        const result = await this.jwt(uuid, time)

        if (result.error)
            throw result.error

        return result.jwt
    }

    async authenticate(data) {
        let connection = null

        let uuid = null
        try {
            connection = await this._pool.getConnection()

            const { uid: f_uid } = appsettings.auth.firebase ?
                await admin.auth().verifyIdToken(data.token) :
                { uid: uuid4() }

            let [[user_data]] = await connection.query(`SELECT * FROM user WHERE firebase_uid = '${f_uid}'`)

            if (user_data === undefined) {
                uuid = uuid4()
                connection.query(
                    `INSERT INTO user(uuid, firebase_uid, email, nickname, photo, last_login, created_date)
                    VALUES('${uuid}', '${f_uid}', '${data.email}', '${data.name}', '${data.photo}', UTC_TIMESTAMP(), UTC_TIMESTAMP())`
                )
                this._cache.push(uuid)
                user_data = {
                    uuid: uuid,
                    email: data.email,
                    name: data.name,
                    photo: data.photo
                }
            }

            const access_token = await this.issue(
                user_data.uuid,
                appsettings.token_expire.access_expire
            )
            const refresh_token = await this.issue(
                user_data.uuid,
                appsettings.token_expire.refresh_expire
            )

            return { data: data, access_token: access_token, refresh_token: refresh_token, error: null }
        } catch (error) {
            return { data: null, token: null, error: error }
        } finally {
            connection.release()
        }
    }

    async validate(token) {
        let payload = null
        try {
            payload = await jwt.verify(token, appsettings.secret_key)

            if (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] == null)
                throw 'invalid name.'

            if (this._cache.includes(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]) == false)
                throw 'invalid use.'

            return { payload: payload, error: null }
        } catch (err) {
            return { payload: payload, error: err }
        }
    }

    async assert(access, refresh) {
        // refresh token 만료 검증
        const { payload: refresh_payload, error: refresh_err } = await this.validate(refresh)


        if (refresh_err) {
            if (refresh_err.name == "TokenExpiredError")
                throw "refresh token이 만료되었습니다."
            else
                throw "올바르지 않은 token입니다."
        }

        const uuid = refresh_payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
        if (uuid == null)
            throw 'invalid uuid.'

        // access token 만료 검증
        const { payload: access_payload, error: access_err } = await this.validate(access)

        if (access_err) {
            if (access_err.name == "TokenExpiredError") {
                // 재발행
                access = this.issue(uuid, appsettings.token_expire.access_expire)
                refresh = this.issue(uuid, appsettings.token_expire.refresh_expire)
            } else {
                throw "올바르지 않은 token 입니다."
            }
        }

        return { access: access, refresh: refresh, uuid: uuid }
    }

    async jwt(uuid, ttl) {
        const claims = {
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": uuid,
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User"
        }

        try {
            return {
                jwt: await jwt.sign(claims, appsettings.secret_key, { expiresIn: ttl }),
                error: null
            }
        } catch (err) {
            return { jwt: null, error: err }
        }
    }
}

module.exports = new Authenticator()
