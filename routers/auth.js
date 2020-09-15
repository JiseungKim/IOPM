const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

router.post('/authenticate', async_handler(async (req, res, next) => {
    const id_token = req.body.token
    // verify firebase id token

    const access_token = 'sample access token'
    const refresh_token = 'sample refresh token'
    res.json({ success: true, uuid: 'uuid', tokens: { access: access_token, refresh: refresh_token } })
}))

module.exports = router