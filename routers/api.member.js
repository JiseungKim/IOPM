const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Member = require('../models/member')
const sha256 = require('../modules/SHA256')

const member = new Member()

const member_sequelize = require('../models/member_sequelize')

// router.put('/login', async_handler(async(req, res, next) => {
//     try {
//         const email = await member.login(req.body)
//         res.json({ success:true, email:email })
//     } catch (err) {
//         console.log(err)
//         res.json({ success:false, error:err })
//     }
// }))

router.get('/all',async_handler(async(req, res, next)=> {
    try {
        const members = await member.get_all()
        res.json(members)
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.get('/get/:id', async_handler(async(req, res, next) => {
    try {
        const mem = await member.get(req.params.id)
        res.json({ success:true, member:mem })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.post('/signup', async_handler(async(req, res, next) => {
    try {
        // const id = await member.insert(req.body)

        const code = sha256(req.body.password)
        member_sequelize.create({
            email: req.body.email,
            password: code,
            name: req.body.name,
            nickname: req.body.nickname,
            gender: req.body.gender,
            phone: req.body.phone,
            
        })

        // res.json({ success:true, id:id })
        res.json({ success:true, email:req.body.email })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.put('/modify', async_handler(async(req, res, next) => {
    try {
        
        await member.update(req.body)

        res.json({ success:true, id:req.body.id })

    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.delete('/remove/:id', async_handler(async(req, res, next) => {
    try {
        await member.remove(req.params.id)
        res.json({ success:true, id:req.params.id })
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.get('/check_email/:email', async_handler(async(req,res,next) => {
    try {
        const count = await member.check_email(req.params.email)

        if(count > 0) {
            res.json({ success:true, available: false })
        } else {
            res.json({ success:true, available: true })
        }
        
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

router.get('/check_nickname/:nickname', async_handler(async(req,res,next) => {
    try {
        const count = await member.check_nickname(req.params.nickname)

        if(count > 0) {
            res.json({ success:true, available: false })
        } else {
            res.json({ success:true, available: true })
        }
    
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router