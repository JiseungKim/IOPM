const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

router.get('/', async_handler(async (req, res, next) => {
    res.render('teams')
}))

router.get('/:name', async_handler(async (req, res, next) => {
    res.render('team')
}))

router.get('/:name/members', async_handler(async (req, res, next) => {
    res.render('members')
}))

module.exports = router