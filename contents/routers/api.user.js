const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const User = require('../models/user')

// const middleware = require('../models/middleware')
// const middleware = (req, res, next) => {
//     console.log("middleware")
//     next()
// }

const user = new User()

router.get('/all', async_handler(async (req, res, next) => {
    try {
        const users = await user.find_all()
        res.json({ success: true, users: users })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.get('/find_by_id/:uid', async_handler(async (req, res, next) => {
    try {
        const mem = await user.find(req.params.uid)

        if (mem == null)
            throw "없는 사용자입니다."

        res.json({ success: true, user: mem })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/signup', async_handler(async (req, res, next) => {
    try {
        const id = await user.add(req.body)

        res.json({ success: true, id: id })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/update/:uid', async_handler(async (req, res, next) => {
    try {
        const success = await user.update(req.params.uid, req.body)

        if (success == null)
            throw "중복된 닉네임입니다."

        res.json({ success: success, id: req.body.id })

    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/remove/:uid', async_handler(async (req, res, next) => {
    try {
        const success = await user.remove(req.params.uid)
        res.json({ success: success })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

module.exports = router