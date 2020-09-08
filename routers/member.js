const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const mysql = require('mysql2/promise')
const getConnection = require('../modules/db_connect')
const Member = require('../models/member')
const mongoose = require('mongoose')

router.get('/',async_handler(async(req, res, next)=> {
    const connection = await getConnection()
    const [members] = await connection.query("select * from member")
    connection.release()
    res.render('member',{members})
}))

router.get('/api', async_handler(async(req, res, next)=> {
    const connection = await getConnection()
    const [rows] = await connection.query('select * from member')
    res.send(rows)
}))

router.get('/signup', (req, res, next) => {
    res.render('signup')
}) 

router.post('/signup', async_handler(async(req, res, next) => {
    User.find({id:req.body.id})
        .exec()
        .then(user => {
            if(user.length >= 1) {
                res.send("이미 존재하는 이메일입니다")
            }else {
                const user = new User({
                    _id: req.body.id,
                    _password: req.body.password,
                    _name: req.body.name,
                    _nickname: req.body.nickname,
                    _gender: req.body.gender,
                    _position: req.body.position
                })

                user.save()
                    .then(result => {
                        console.log(result)
                        res.redirect("/")
                    })
                    .catch(err=>{
                        console.log(err)
                    })
            }
        })
    const connection = await getConnection()
    res.send("등록한다!")
}))
/*

    const connection = await pool.getConnection()
    const [rows] = await connection.quer('select * from member')
    for (let i in rows)
        console.log(rows[i])
    connection.release()
    res
*/

module.exports = router