const appsettings = require('./helpers/config')
const async_handler = require('express-async-handler')
const express = require('express')

const app = express()
app.set('view engine', 'ejs');
app.locals.cdn = require('./helpers/cdn').cdn

app.use(express.json())
app.use(express.static('./public'))

app.get('/', function (req, res) {
    res.render('hello', { name: 'cshyeon' })
})

app.post('/post', async_handler(async (req, res, next) => {
    console.log(req.body)
    res.send({
        'name': 'cshyeon',
        'order': 1
    })
}))

app.use('/example', require('./routers/cshyeon'))

app.listen(appsettings.port, () => {
    console.log(`listen to ${appsettings.port}`)
})