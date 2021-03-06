const async_handler = require('express-async-handler')
const authenticator = require('../models/authenticator')

const middleware = async_handler(async (req, res, next) => {

    try {
        const { access, refresh, id } = await authenticator.assert
            (
                req.cookies.access_token || req.headers.access_token,
                req.cookies.refresh_token || req.headers.refresh_token
            )

        res.cookie('access_token', access, { httpOnly: true })
        res.cookie('refresh_token', refresh, { httpOnly: true })
        req.headers.id = id
        next()

    } catch (e) {
        console.error(e)
        res.redirect('/')
    }
})
module.exports = middleware