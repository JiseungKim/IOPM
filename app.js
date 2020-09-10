// const async_handler = require('express-async-handler')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('./public'))
app.use(bodyParser.urlencoded({extended:true})) // url encoding 확장
app.use(bodyParser.json()) // request body에 오는 데이터를 json으로 변환

app.get('/', function(req, res) {
    res.render('start', {title:'jiseung', content:'핵고수가되자'})
})

app.use('/member', require('./routers/member'))
app.use('/api/member', require('./routers/api.member'))

app.listen(3000, ()=> {
    console.log("listen to 3000..")
})