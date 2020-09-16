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

admin.initializeApp({
    credential: admin.credential.cert(service_account),
    databaseURL: "https://iopm-f7940.firebaseio.com",
})

router.post(
    "/authenticate",
    async_handler(async (req, res, next) => {
        const id_token = req.body.token

        try {
            let user_info = null

            let firebase_uid = null

            if (appsettings.auth.firebase) {
                const decoded_token = await admin.auth().verifyIdToken(id_token)
                firebase_uid = decoded_token.uid
            } else {
                firebase_uid = uuid4()
            }

            const exist = await user.find_by_firebase_uid(firebase_uid)

            if (exist == null) {
                user_info = { uuid: uuid4(), firebase_uid: firebase_uid }
                await user.create_uuid(user_info)
            } else {
                user_info = exist
            }

            // jwt 발급
            const access_token = jwt.sign(
                {
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
                        user_info.uuid,
                },
                appsettings.secret_key,
                {
                    expiresIn: appsettings.token_expire.access_expire,
                }
            )
            const refresh_token = jwt.sign(
                {
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
                        user_info.uuid,
                },
                appsettings.secret_key,
                {
                    expiresIn: appsettings.token_expire.refresh_expire,
                }
            )

            res.cookie("access_token", access_token, { httpOnly: true })
            res.cookie("refresh_token", refresh_token, { httpOnly: true })

            res.json({
                success: true,
                uuid: user_info.uuid,
                tokens: { access: access_token, refresh: refresh_token },
            })
        } catch (err) {
            console.log(err)
            res.json({ success: false, error: err })
        }
    })
)

module.exports = router
