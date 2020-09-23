const nodemailer = require('nodemailer')
const appsettings = require('./config')

// https://myaccount.google.com/lesssecureapps
// 보안 수준이 낮은 앱 허용 : 사용
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: appsettings.mail.id,
        pass: appsettings.mail.pw
    }
})

module.exports = {
    send: async function (to, title, contents) {
        const option = {
            from: appsettings.mail.id,
            to: to,
            subject: title,
            text: contents
        }

        return await transporter.sendMail(option)
    }
}