const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Section = require('../models/section')

const section = new Section()

router.get('/find_by_id/:sid', async_handler(async (req, res, next) => {
    try {
        const sct = await section.find_by_id(req.params.sid)
        res.json({ success:true, section:sct })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.get('/find_by_project/:pid', async_handler(async (req, res, next) => {
    try {
        const sct = await section.find_by_id(req.params.pid)
        res.json({ success:true, sections:sct })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// section 생성
router.post('/make', async_handler(async(req, res, next) => {
    try {
        const sid = await section.add(req.body.section, req.body.user_id, req.body.project_id)

        if(sid == null)
            throw "섹션 이름이 중복됩니다"

        res.json({ success:true, section_id:sid })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/update/:sid', async_handler(async(req, res, next) => {
    try {
        const success = await section.update(req.params.sid, req.body.user_id, req.body.user_id, req.body.project_id)

        if(success == null)
            throw "섹션 이름이 중복됩니다"
        
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/remove/:sid', async_handler(async(req, res, next) => {
    try {
        const success = await section.remove(req.params.sid, req.body.user_id, req.body.project_id)
        
        if(success == null)
            throw "관리자가 아닙니다."
        
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))
module.exports = router