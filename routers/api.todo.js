const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

const Todo = require('../models/todo')
const todo = new Todo()

// todo 상세 정보
router.get('/find_by_id/:tid', async_handler(async(req, res, next) => {
    try {
        const td = await todo.find_by_id(req.params.tid)
        res.json({ success:true, todo:td })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))


// 섹션에 속한 todo 찾기
router.get('/find_by_section/:sid', async_handler(async(req, res, next) => {
    try {
        const todos = await todo.find_by_section(req.params.sid)
        res.json({ success:true, todos:todos })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

// 특정 project에 속한 todo 찾기
router.get('/find_by_project/:pid', async_handler(async(req, res, next) => {
    try {
        const todos = await todo.find_by_project(req.params.pid)
        res.json({ success:true, todos:todos })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/make', async_handler(async(req, res, next) => {
    try {
        const tid = await todo.add(req.body)
        res.json({ success:true, todo_id:tid })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.put('/update/:tid', async_handler(async(req, res, next) => {
    try {
        const success = await todo.update(req.body.todo, req.params.tid, req.body.member_id)

        if(success == null)
            throw "관리자가 아닙니다."

        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.delete('/remove/:tid', async_handler(async(req, res, next) => {
    try {
        const success = await todo.remove(req.params.tid, req.body.member_id)

        if(success == null)
            throw "관리자가 아닙니다."

        res.json({ success:success })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router