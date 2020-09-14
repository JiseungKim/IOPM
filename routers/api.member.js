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

router.put('/update', async_handler(async(req, res, next) => {
    try {
        
        await member.update(req.body)

        res.json({ success:true, id:req.body.id })

    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.delete('/remove/:id', async_handler(async(req, res, next) => {
    try {
        const success = await member.remove(req.params.id)
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router