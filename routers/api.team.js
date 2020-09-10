const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

router.get('/', async_handler(async (req, res, next) => {
    res.json([
        {
            name: 'cshyeon',
            hope: 'To be the best developer'
        },
        {
            name: 'jiseung',
            hope: 'joy'
        }
    ])
}))

router.get('/:id', async_handler(async (req, res, next) => {
    res.json({
        name: 'cshyeon',
        attr: 'The true man'
    })
}))

module.exports = router