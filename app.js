// const async_handler = require('express-async-handler')
const express = require('express')

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('./public'))

app.get('/', function(req, res) {
    res.render('start', {title:'jiseung', content:'핵고수가되자'})
})

app.use('/member', require('./routers/member'))

app.listen(3000, ()=> {
    console.log("listen to 3000..")
})