const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')

const Todo = require('../models/todo')
const todo = new Todo()

// todo 상세 정보
router.get('/find_by_id/:tid', async_handler(async (req, res, next) => {
    try {
        const td = await todo.find(req.params.tid)
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
        const { sections, mine } = await todo.find_by_project(req.headers.id, req.params.pname)
        res.json({ success: true, sections: sections, mine: mine })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/make', async_handler(async (req, res, next) => {
    try {
        const created = await todo.add(req.headers.id, req.body.section, req.body.title, req.body.desc)
        res.json({ success: true, todo: created })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/update/:id', async_handler(async (req, res, next) => {
    try {
        await todo.update(req.body.todo, req.params.id, req.headers.id)
        res.json({ success: success })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

router.post('/remove/:id', async_handler(async (req, res, next) => {
    try {
        await todo.remove(req.params.id, req.headers.id)
        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: err })
    }
}))

module.exports = router