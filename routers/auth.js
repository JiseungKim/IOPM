const { Router } = require("express")
const router = Router()
const async_handler = require("express-async-handler")
const appsettings = require("../modules/config")

const uuid4 = require("uuid4")
const jwt = require("jsonwebtoken")
const admin = require("firebase-admin")
const service_account = require("../config/iopm-f7940-firebase-adminsdk-ntf1b-b42b1f00ad.json")

const User = require("../models/user")
const user = new User()

const CheckValidate = require('../models/authenticator')
// const authenticator = require('./authenticator')

const check_validate = new CheckValidate()

admin.initializeApp({
    credential: admin.credential.cert(service_account),
    databaseURL: "https://iopm-f7940.firebaseio.com",
})

router.post(
    "/authenticate",
    async_handler(async (req, res, next) => {
        const id_token = req.body.token

        try {

            // const payload = await admin.auth().verifyIdToken(id_token)
            // firebase_uid = payload.uid

            const result = await check_validate.authenticate(id_token)

            res.cookie("access_token", result.access_token, { httpOnly: true })
            res.cookie("refresh_token", result.refresh_token, { httpOnly: true })

            res.json({
                success: true,
                uuid: result.uuid,
                tokens: { access: result.access_token, refresh: result.refresh_token },
            })
        } catch (err) {
            console.log(err)
            res.json({ success: false, error: err })
        }
    })
)

module.exports = router
