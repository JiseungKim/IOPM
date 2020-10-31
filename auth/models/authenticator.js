const appsettings = require("../modules/config");
const jwt = require("jsonwebtoken")
const admin = require("firebase-admin")
const uuid4 = require('uuid4')
const accounts = require('../models/accounts')
const request = require('request-promise-native')

class Authenticator {

    async issue(id, time) {

        const result = await this.jwt(id, time)

        if (result.error)
            throw result.error

        return result.jwt
    }

    async authenticate(data) {
        try {
            const { uid: f_uid } = appsettings.auth.firebase ?
                await admin.auth().verifyIdToken(data.token) :
                { uid: uuid4() }

            const { user, created } = await accounts.get(f_uid, data)
            if (created) {
                await request({
                    uri: `http://${await accounts.endpoint(user.id)}/api/user/init`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
            }
            const access_token = await this.issue(
                user.id,
                appsettings.token_expire.access_expire
            )
            const refresh_token = await this.issue(
                user.id,
                appsettings.token_expire.refresh_expire
            )

            return {
                user: user,
                token: {
                    access: access_token,
                    refresh: refresh_token
                },
                error: null
            }
        } catch (error) {
            return { user: null, token: null, error: error }
        }
    }

    async validate(token) {
        let payload = null
        try {
            payload = await jwt.verify(token, appsettings.secret_key)

            const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]

            if (id == null)
                throw 'invalid id.'

            if (accounts.host(id) == null)
                throw 'invalid user.'

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

        const id = refresh_payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
        if (id == null)
            throw 'invalid uuid.'

        // access token 만료 검증
        const { payload: access_payload, error: access_err } = await this.validate(access)

        if (access_err) {
            if (access_err.name == "TokenExpiredError") {
                // 재발행
                access = this.issue(id, appsettings.token_expire.access_expire)
                refresh = this.issue(id, appsettings.token_expire.refresh_expire)
            } else {
                throw "올바르지 않은 token 입니다."
            }
        }

        return { access: access, refresh: refresh, id: id }
    }

    async jwt(id, ttl) {
        const claims = {
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": id,
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
