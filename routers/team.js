const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const Team = require('../models/team')

const team = new Team()


module.exports = router