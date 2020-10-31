
const context = require('./context')
const { Op } = require('sequelize')
const { sequelize } = require('./context')

// TODO: 정규식

class Project {
    async find(id) {
        try {
            return await context.projects.findOne({ where: { id: id } })
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async find_by_owner(user) {
        try {
            return await context.projects.findAll({ where: { owner: user.id } })
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async find_by_user(uid) {
        try {
            const user = await context.users.findOne({ where: { id: uid }, include: [{ model: context.projects }] })
            if (user == null)
                return []

            return user.projects
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async add(name, desc, uid) {

        const t = await sequelize.transaction()
        try {
            // TODO: 프로젝트 이름 정규식
            // 자신이 만든 프로젝트에 중복된 팀 이름이 있는지 검사

            const user = await context.users.findOne({
                where: { id: uid },
                include: [{ model: context.projects }]
            })

            if (user == null)
                throw '계정이 없습니다.'

            for (const project of user.projects) {
                if (project.name == name)
                    throw "프로젝트 이름이 중복됩니다"
            }

            const project = await context.projects.create({
                name: name,
                desc: desc,
                owner: uid
            }, { transaction: t })

            await project.addUsers(user, { transaction: t })
            await t.commit()
            return project
        } catch (e) {
            console.error(e)
            t.rollback()
            throw e
        }
    }

    async update(project, uid, pid) {
        const t = sequelize.transaction()
        try {
            const found = await context.projects.findOne({ where: { [Op.and]: [{ id: pid }, { owner: uid }] } }, { transaction: t })
            if (found == null)
                throw '권한이 없습니다.'

            await context.projects.update({ name: project.name }, { where: { id: pid } }, { transaction: t })
            await t.commit()
        } catch (err) {
            t.rollback()
            throw err
        }
    }

    async remove(pid, uid) {
        const t = await sequelize.transaction()
        try {
            const found = await context.projects.findOne({ where: { [Op.and]: { id: pid, owner: uid } } }, { transaction: t })
            if (found == null)
                throw '권한이 없습니다.'

            await context.projects.destroy({ where: { id: pid } }, { transaction: t })
            await t.commit()
        } catch (err) {
            t.rollback()
            throw err
        }
    }

    async invite(name, uid, email) {

        const t = await sequelize.transaction()
        try {
            const project = await context.projects.findOne({ where: { name: name, owner: uid } }, { transaction: t })
            if (project == null)
                throw '프로젝트가 없습니다.'

            const to = await context.users.findOne({ where: { email: email }, include: [{ model: context.projects }] }, { transaction: t })
            if (to == null)
                throw '상대가 없습니다.'

            for (const x of to.projects) {
                if (x.id == project.id)
                    throw '이미 참여중인 유저입니다.'
            }

            await project.addUser(to, { transaction: t })
            await t.commit()
        } catch (e) {
            t.rollback()
            console.error(e)
            throw e
        }
    }
}

module.exports = Project