const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Participation = require('../models/participation')

const participation = new Participation()

router.get('/all',async_handler(async(req, res, next)=> {
    try {
        const participations = await participation.find_all()
        res.json({ success:true, participations:participations})
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err})
    }
}))

router.post('/join', async_handler(async(req, res, next) => {
    try {
        const pid = await participation.add(req.body)

        if(pid == null)
            throw "이미 가입되어있는 멤버입니다."

        res.json({ success:true, id:pid })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/out', async_handler(async(req, res, next) => {
    try {
        const success = await participation.remove(req.body)
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router