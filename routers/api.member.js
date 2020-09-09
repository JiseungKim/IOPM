const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Member = require('../models/member')

const member = new Member()

router.get('/all',async_handler(async(req, res, next)=> {
    const members = await member.get_all()
    res.json(members)
}))

router.get('/get/:id', async_handler(async(req, res, next) => {
    const mem = await member.get(req.params.id)
    res.json(mem)
}))

router.post('/signup', async_handler(async(req, res, next) => {
    
    try {
        await member.insert({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            nickname: req.body.nickname,
            gender: req.body.gender,
            phone: req.body.phone,
            photo: req.body.photo
        })

    } catch (err) {
        
    } finally {
        
    }
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
}))

router.delete('/delete/:id', async_handler(async(req, res, next) => {
    await member.delete(req.params.id)
}))


module.exports = router