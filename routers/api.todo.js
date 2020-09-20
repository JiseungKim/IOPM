const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

const Todo = require('../models/todo')
const todo = new Todo()

// todo 상세 정보
router.get('/find_by_id/:tid', async_handler(async (req, res, next) => {
    try {
        const td = await todo.find_by_id(req.params.tid)
        res.json({ success: true, todo: td })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))


// 섹션에 속한 todo 찾기
router.get('/find_by_section/:sid', async_handler(async (req, res, next) => {
    try {
        const todos = await todo.find_by_section(req.params.sid)
        res.json({ success: true, todos: todos })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

// 특정 project에 속한 todo 찾기
router.get('/find_by_project/:pname', async_handler(async (req, res, next) => {
    try {
        const sections = await todo.find_by_project(req.headers.uuid, req.params.pname)
        res.json({ success: true, sections: sections })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/make', async_handler(async (req, res, next) => {
    try {
        const tid = await todo.add(req.headers.uuid, req.body.section, req.body.title, req.body.desc)

        if (tid == null)
            throw "참여자가 아닙니다."

        res.json({ success: true, todo: { id: tid, title: req.body.title, desc: req.body.desc } })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/update/:tid', async_handler(async (req, res, next) => {
    try {
        const success = await todo.update(req.body.todo, req.params.tid, req.body.user_id)

        if (success == null)
            throw "관리자가 아닙니다."

        res.json({ success: success })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/remove/:tid', async_handler(async (req, res, next) => {
    try {
        const success = await todo.remove(req.params.tid, req.body.user_id)

        if (success == null)
            throw "관리자가 아닙니다."

        res.json({ success: success })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

module.exports = router