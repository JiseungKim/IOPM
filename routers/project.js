const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

router.get('/', async_handler(async (req, res, next) => {
    res.render('projects')
}))

router.get('/:name', async_handler(async (req, res, next) => {
    res.render('project')
}))

router.get('/:name/settings', async_handler(async (req, res, next) => {
    res.render('project_settings')
}))

module.exports = router
