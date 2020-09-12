const express = require('express')
const async_handler = require('express-async-handler')
const appsettings = require('./modules/config')

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('./public'))
app.use(express.json())

app.locals.cdn = require('./modules/cdn')

app.get('/', async_handler(async (req, res, next) => {
    res.render('start', { title: 'jiseung', content: '핵고수가되자' })
}))

app.use('/team', require('./routers/team'))
app.use('/member', require('./routers/member'))
app.use('/api/team', require('./routers/api.team'))
app.use('/api/section', require('./routers/api.section'))
app.use('/api/member', require('./routers/api.member'))

app.get('/', async_handler(async (req, res, next) => {
    res.render('home', { data: { title: 'cshyeon' } })
}))

app.listen(appsettings.common.port, () => {
    console.log(`listen to ${appsettings.common.port}..`)
})
