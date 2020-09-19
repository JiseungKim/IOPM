const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Project = require('../models/project')

const project = new Project()

router.get('/find_by_id/:pid', async_handler(async (req, res, next) => {
    try {
        const found = await project.find_by_id(req.params.pid)
        if (found == null)
            throw `cannot find matched project with id '${req.params.pid}'.`

        res.json({ success: true, project: found })
    } catch (err) {
        console.error(err)
        res.json({ success: false, error: err })
    }
}))

// 관리자로 검색
router.get('/find_by_owner/:uid', async_handler(async (req, res, next) => {
    try {
        const found = await project.find_by_owner(req.params.uid)
        if (found == null)
            throw `cannot find matched project with owner '${req.params.uid}'.`

        res.json({ success: true, projects: found })
    } catch (err) {
        console.error(err)
        res.json({ success: false, error: err })
    }
}))

// 가입한 프로젝트 검색
router.get('/find_by_user/:uid', async_handler(async (req, res, next) => {
    try {
        const found = await project.find_by_user(req.params.uid)
        res.json({ success: true, projects: found })
    } catch (err) {
        console.error(err)
        res.json({ success: false, error: err })
    }
}))

// 프로젝트 생성
router.post('/make', async_handler(async (req, res, next) => {
    // TODO: 팀의 관리자만 생성 가능
    try {
        const pid = await project.add(req.body.project, req.body.user_id)

        if (pid == null)
            throw "프로젝트 이름이 중복됩니다"

        res.json({ success: true, project_id: pid })
    } catch (err) {
        console.error(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/update/:pid', async_handler(async (req, res, next) => {
    try {
        const success = await project.update(req.body.project, req.body.user_id, req.params.pid)

        if (success == null)
            throw "프로젝트 이름이 중복됩니다"

        res.json({ success: success })
    } catch (err) {
        console.error(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/remove/:pid', async_handler(async (req, res, next) => {
    try {
        const success = await project.remove(req.params.pid, req.body.user_id)

        if (success == null)
            throw "관리자가 아닙니다."

        res.json({ success: success })
    } catch (err) {
        console.error(err)
        res.json({ success: false, error: err })
    }
}))

module.exports = router