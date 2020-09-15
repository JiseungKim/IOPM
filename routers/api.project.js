const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Project = require('../models/project')

const project = new Project()

router.get('/find_by_id/:pid', async_handler(async(req, res, next) => {
    try {
        const pj = await project.find_by_id(req.params.pid)
        res.json({ success:true, project:pj })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// 팀으로 검색
router.get('/find_by_team/:tid', async_handler(async(req, res, next) => {
    // TODO: 자신이 속한 팀의 프로젝트만 검색가능하게
    try {
        const pjs = await project.find_by_team(req.params.tid)
        res.json({ success:true, projects:pjs })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// 프로젝트 생성
router.post('/make', async_handler(async(req, res, next) => {
    // TODO: 팀의 관리자만 생성 가능
    try {
        const pid = await project.add(req.body.project, req.body.member_id, req.body.team_id)

        if(pid == null)
            throw "프로젝트 이름이 중복됩니다"

        res.json({ success:true, project_id:pid })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.put('/update/:pid', async_handler(async(req, res, next) => {
    try {
        const success = await project.update(req.body.project, req.body.member_id, req.params.pid)

        if(success == null)
            throw "프로젝트 이름이 중복됩니다"

        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.delete('/remove/:pid', async_handler(async(req, res, next) => {
    try {
        const success = await project.remove(req.params.pid, req.body.member_id)

        if(success == null)
            throw "관리자가 아닙니다."

        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router