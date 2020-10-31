const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Section = require('../models/section')

const section = new Section()

router.get('/find_by_id/:sid', async_handler(async (req, res, next) => {
    try {
        const sct = await section.find(req.params.sid)
        if (sct == null)
            throw '섹션이 없습니다.'

        res.json({ success: true, section: sct })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.get('/find_by_project/:pid', async_handler(async (req, res, next) => {
    try {
        const sct = await section.from_project(req.headers.id, req.params.pid)
        res.json({ success: true, sections: sct })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

// section 생성
router.post('/make', async_handler(async (req, res, next) => {
    try {
        const id = await section.add(req.body.name, req.headers.id, req.body.project)
        res.json({
            success: true, section: {
                id: id,
                name: req.body.name,
            }
        })
    } catch (err) {
        res.json({ success: false, error: err })
    }
}))

router.post('/update/:sid', async_handler(async (req, res, next) => {
    try {
        await section.update(req.params.sid, req.body.section, req.headers.id, req.body.project_id)
        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/remove/:sid', async_handler(async (req, res, next) => {
    try {
        await section.remove(req.params.sid, req.headers.id)
        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))
module.exports = router