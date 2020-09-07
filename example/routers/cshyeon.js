const { Router } = require('express')
const router = Router()
const async_handler = require('express-async-handler')
const mysql = require('mysql2/promise')

const appsettings = require('../helpers/config')

router.get('/', async_handler(async (req, res, next) => {
    const pool = await mysql.createPool({
        host: appsettings.database.host,
        user: appsettings.database.uid,
        password: appsettings.database.pwd,
        database: appsettings.database.name
    })

    const connection = await pool.getConnection()
    const [rows] = await connection.query('SELECT * FROM Users')
    for (const x in rows)
        console.log(rows[x])
    connection.release()
    res.send(`hello example`)
}))

router.post('/post', async_handler(async (req, res, next) => {
    console.log(req.body)
    res.send({
        'name': 'cshyeon',
        'order': 1
    })
}))

module.exports = router