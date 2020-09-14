const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Team = require('../models/team')
const Participation = require('../models/participation')

const team = new Team()
const participation = new Participation()

router.get('/find/all', async_handler(async(req, res, next) => {
    try {
        const teams = await team.find_all()
        res.json({ success:true, teams:teams})
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.get('/find_by_id/:id', async_handler(async(req, res, next) => {
    try {
        const tm = await team.find(req.params.id)
        res.json({ success:true, team:tm })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// 팀 관리자로 찾기
router.get('/find_by_owner/:owner', async_handler(async(req, res, next) => {
    try {
        const teams = await team.find_by_owner(req.params.owner)
        res.json({ success:true, teams:teams })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// 사용자가 가입한 팀 찾기
router.get('/find_by_member/:mid', async_handler(async(req, res, next) => {
    try {
        const teams = await team.find_by_member(req.params.mid)
        res.json({ success:true, teams:teams })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// 팀 멤버 찾기
router.get('/find_by_team/:tid', async_handler(async(req, res, next) => {
    try {
        const members = await team.find_by_team(req.params.tid)
        res.json({ success:true, members:members })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/make', async_handler(async(req, res, next) => {
    try {
        
        const tid = await team.add(req.body.team, req.body.member_id)

        if(!tid)
            throw "팀 이름이 중복됩니다"

        const pid = await participation.add({
            team_id:tid,
            member_id:req.body.member_id
        })
        
        if(pid == null)
            throw "이미 가입되어있는 멤버입니다."

        res.json({ success:true, team_id:tid, participation_id:pid})
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
        res.json({ success:success, team_id:req.params.id })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router