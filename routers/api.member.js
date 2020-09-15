const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Member = require('../models/member')

const member = new Member()

router.get('/all',async_handler(async(req, res, next)=> {
    try {
        const members = await member.find_all()
        res.json({ success:true, members:members})
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err})
    }
}))

router.get('/find_by_id/:id', async_handler(async(req, res, next) => {
    try {
        const mem = await member.find(req.params.id)

        if(mem == null)
            throw "없는 사용자입니다."

        res.json({ success:true, member:mem})
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/signup', async_handler(async(req, res, next) => {
    try {
        const id = await member.add(req.body)

        res.json({ success:true, id:id })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/update/:id', async_handler(async(req, res, next) => {
    try {
        const success = await member.update(req.params.id, req.body)

        if(success == null)
            throw "중복된 닉네임입니다."

        res.json({ success:success, id:req.body.id })

    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/remove/:id', async_handler(async(req, res, next) => {
    try {
        const success = await member.remove(req.params.id)
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router