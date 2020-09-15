const { Router } = require("express");
const router = Router();
const async_handler = require("express-async-handler");

const uuid4 = require("uuid4");
const jwt = require("jsonwebtoken");

const appsettings = require("../modules/config");

const admin = require("firebase-admin");
const service_account = require("../config/iopm-f7940-firebase-adminsdk-ntf1b-b42b1f00ad.json");

admin.initializeApp({
  credential: admin.credential.cert(service_account),
  databaseURL: "https://iopm-f7940.firebaseio.com",
});

router.post(
  "/authenticate",
  async_handler(async (req, res, next) => {
    const id_token = req.body.token;

    try {
      const decoded_token = await admin.auth().verifyIdToken(id_token);
      const uid = decoded_token.uid;

      if (!uuid4.valid(uid)) throw "유효하지 않습니다";

      const access_token = jwt.sign(
        { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": uid },
        appsettings.secret_key,
        {
          expireIn: appsettings.token_expire.access_expire,
        }
      );
      const refresh_token = jwt.sign(
        { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": uid },
        appsettings.secret_key,
        {
          expireIn: appsettings.token_expire.refresh_expire,
        }
      );

      res.json({
        success: true,
        uuid: uid,
        tokens: { access: access_token, refresh: refresh_token },
      });
    } catch (err) {
      console.log(err);
      res.json({ success: false });
    }
  })
);

module.exports = router;
