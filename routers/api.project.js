const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Project = require('../models/project')

const team = new Team()
const project = new Project()

router.get('/find_by_team/:tid', async_handler(async(req, res, next) => {
    try {
        const tm = await team.find(req.params.tid)
        res.json({ success:true, team:tm })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))


router.post('/make', async_handler(async(req, res, next) => {
    try {
        
        const tid = await team.add(req.body.team, req.body.member_id)

        if(tid == null)
            throw "팀 이름이 중복됩니다"

        const pid = await project.add({
            team_id:tid,
            member_id:req.body.member_id
        })
        
        if(pid == null)
            throw "이미 가입되어있는 멤버입니다."

        res.json({ success:true, team_id:tid, project_id:pid})
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.put('/update', async_handler(async(req, res, next) => {
    try {
        const success = await team.update(req.body.mid, req.body.team)
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.delete('/remove/:id', async_handler(async(req, res, next) => {
    try {
        const success = await team.remove(req.params.id, req.body.mid)
        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router