const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Team = require('../models/team')

const team = new Team()

router.get('/all',async_handler(async(req, res, next)=> {
    try {
        
    } catch (err) {
        console.log(err)
        res.json({ success:false, error:err })
    }
}))

module.exports = router