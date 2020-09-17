const appsettings = require('../modules/config')
const jwt = require("jsonwebtoken")
const uuid4 = require("uuid4")
const async_handler = require('express-async-handler')
const Authenticator = require('./authenticator')

const authenticator = new Authenticator()

const middleware = async_handler(async (req, res, next) => {

    console.log("refresh_token :", req.cookies.refresh_token)
    console.log("access_token :", req.cookies.access_token)

    try {
        let access_token = req.cookies.refresh_token
        let refresh_token = req.cookies.refresh_token

        // refresh token 만료 검증
        const { payload: refresh_payload, error: refresh_err } = await authenticator.validate(req.cookies.refresh_token)


        if (refresh_err) {
            if (refresh_err.name == "TokenExpiredError")
                throw "refresh token이 만료되었습니다."
            else
                throw "올바르지 않은 token입니다."
        }

        const uuid = refresh_payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]

        // access token 만료 검증
        const { payload: access_payload, error: access_err } = await authenticator.validate(req.cookies.access_token)

        if (access_err) {
            if (access_err.name == "TokenExpiredError") {
                // 재발행
                access_token = authenticator.issue(uuid, appsettings.token_expire.access_expire)
                refresh_token = authenticator.issue(uuid, appsettings.token_expire.refresh_expire)

                res.cookie('access_token', access_token, { httpOnly: true })
                res.cookie('refresh_token', refresh_token, { httpOnly: true })
            } else {
                throw "올바르지 않은 token 입니다."
            }
        }

        req.headers.uuid = uuid

        next()

    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
})
module.exports = middleware


