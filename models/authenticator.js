const appsettings = require("../modules/config");
const mysql = require("mysql2/promise")
const jwt = require("jsonwebtoken")
const admin = require("firebase-admin")
const uuid4 = require('uuid4')

class Authenticator {
    constructor() {
        this._pool = mysql.createPool(appsettings.database)
    }

    async issue(uuid, time) {

        const result = await this.jwt(uuid, time)

        if (result.error)
            throw result.error

        return result.jwt
    }

    async authenticate(id_token) {
        let connection = null

        let uuid = null
        try {
            connection = await this._pool.getConnection()

            const { f_uid } = appsettings.auth.firebase ?
                await admin.auth().verifyIdToken(id_token) :
                { f_uid: uuid4() }

            const [[user_data]] = await connection.query(`SELECT * FROM user WHERE firebase_uid = '${f_uid}'`)

            if (user_data === undefined) {
                uuid = uuid4()
                connection.query(
                    `INSERT INTO user(uuid, firebase_uid, last_login, created_date)
                    VALUES('${uuid}', '${f_uid}', UTC_TIMESTAMP(), UTC_TIMESTAMP())`
                )
            } else {
                uuid = user_data.uuid
            }

            const access_token = await this.issue(
                uuid,
                appsettings.token_expire.access_expire
            )
            const refresh_token = await this.issue(
                uuid,
                appsettings.token_expire.refresh_expire
            )

            return { uuid: uuid, access_token: access_token, refresh_token: refresh_token, error: null }
        } catch (error) {
            return { uuid: uuid, token: null, error: error }
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

            return { payload: payload, error: null }
        } catch (err) {
            return { payload: payload, error: err }
        }

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
