const { Router } = require("express")
const router = Router()
const async_handler = require("express-async-handler")
const admin = require("firebase-admin")
const service_account = require("../config/iopm-f7940-firebase-adminsdk-ntf1b-b42b1f00ad.json")
const authenticator = require('../models/authenticator')

admin.initializeApp({
    credential: admin.credential.cert(service_account),
    databaseURL: "https://iopm-f7940.firebaseio.com",
})

router.post(
    "/authenticate",
    async_handler(async (req, res, next) => {
        const id_token = req.body.token

        try {

            const result = await authenticator.authenticate(req.body)
            if (result.error)
                throw result.error

            res.cookie("access_token", result.access_token, { httpOnly: true })
            res.cookie("refresh_token", result.refresh_token, { httpOnly: true })

            res.json({
                success: true,
                uuid: result.uuid,
                tokens: { access: result.access_token, refresh: result.refresh_token },
            })
        } catch (err) {
            console.error(err)
            res.json({ success: false, error: err })
        }
    })
)

module.exports = router
