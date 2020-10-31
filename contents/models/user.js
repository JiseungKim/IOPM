const context = require('./context')
const { Op } = require('sequelize')
const { sequelize } = require('./context')

const sha256 = require("../modules/SHA256")
// 팀이름 공백, 영문, 한글, 숫자, _ , -만 가능하게 검사하기
// SQL injection!

class User {

    async init(user) {
        const t = await sequelize.transaction()
        try {
            const created = await context.users.create({
                id: user.id,
                uuid: user.uuid,
                email: user.email,
                nickname: user.nickname,
                phone: user.phone,
                photo: user.photo
            }, { transaction: t })

            t.commit()
            return created
        } catch (e) {
            console.error(e)
            t.rollback()
            return null
        }
    }

    // firebase uid 검증
    async find(id) {
        try {
            return await context.users.findOne({ where: { id: id } })
        } catch (e) {
            console.error(e)
            return null
        }
    }
    // firebase uid 검증
    async find_by_uuid(uuid) {
        try {
            return await context.users.findOne({ where: { uuid: uuid } })
        } catch (e) {
            console.error(e)
            return null
        }
    }

    // id 검증
    async exists(id) {
        try {
            return this.find(id) != null
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async all() {
        try {
            return await context.users.findAll()
        } catch (e) {
            console.error(e)
            return []
        }
    }

    assert(user, rows) {
        // TODO: 정규식!!
        const email_check = /([a-z0-9_\ .-]+)@([/da-z\ .-]+)\ .([a-z\ .]{2,6})/

        for (let row of rows) {
            if (row.email == user.email) throw "중복된 이메일입니다."
            if (row.nickname == user.nickname) throw "중복된 닉네임입니다."
            if (row.phone == user.phone) throw "중복된 핸드폰번호입니다."
        }
    }

    async update(user) {
        const code = sha256(user.password)
        const t = await sequelize.transaction()

        try {
            const found = await context.users.findOne({
                where: {
                    [Op.or]: [
                        { email: user.email },
                        { nickname: user.nickname }]
                }
            })

            if (found != null) {
                if (found.email == user.email)
                    throw "중복된 이메일입니다."

                if (found.nickname == user.nickname)
                    throw "중복된 닉네임입니다."
            }

            await context.users.update({
                password: code,
                email: user.email,
                nickname: user.nickname,
                phone: user.phone,
                photo: user.photo
            }, { transaction: t })

            t.commit()
            return user.id
        } catch (e) {
            console.error(e)
            t.rollback()
            throw e
        }
    }

    async remove(id) {
        try {
            await user.destroy({ where: { id: id } })
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}

module.exports = User
