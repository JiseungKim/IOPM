const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Member = require('../models/member')

const member = new Member()

router.get('/all',async_handler(async(req, res, next)=> {
    const members = await member.get_all()
    // console.log(members)
    res.render('member',{members})
    // const connection = await getConnection()
    // const [members] = await connection.query("select * from member")
    // connection.release()
    // res.render('member',{members})
}))

router.get('/get/:id', async_handler(async(req, res, next) => {
    const mem = await member.get(req.params.id)
    console.log(mem)
    res.send(mem)
}))

router.get('/api', async_handler(async(req, res, next)=> {
    // const connection = await getConnection()
    // const [rows] = await connection.query('select * from member')
    // res.send(rows)
}))

router.get('/signup', (req, res, next) => {
    res.render('signup')
}) 

router.post('/signup', async_handler(async(req, res, next) => {
    // console.log(req)
    await member.insert({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        nickname: req.body.nickname,
        gender: req.body.gender,
        phone: req.body.phone,
        photo: req.body.photo
    })
    res.redirect('/member/all')
}))

router.get('/modify/:id', async_handler(async(req, res, next) => {
    const mem = await member.get(req.params.id)
    res.render('modify', {member:mem})
}))

router.put('/modify/:id', async_handler(async(req, res, next) => {
    await member.update({
        id: req.params.id,
        // _email: req.body.email,
        // _name: req.body.name,
        nickname: req.body.nickname,
        // _gender: req.body.gender,
        phone: req.body._phone,
        photo: req.body.photo
    })
    res.send(`수정 - ${id}`)
}))

router.delete('/delete/:id', async_handler(async(req, res, next) => {
    await member.delete(req.params.id)
    res.send(`삭제 - ${id}`)
}))

module.exports = router