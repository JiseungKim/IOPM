
const context = require('./context')
const { Op } = require('sequelize')
const { sequelize } = require('./context')

// TODO: 정규식

class Todo {
    async find(id) {
        try {
            return await context.todos.findOne({
                where: { [Op.or]: [{ id: id }, { deleted: false }] }
            })
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async find_by_section(sid) {

        try {
            return await context.todos.findAll({ where: { section_id: sid } })
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async find_by_project(uid, pname) {

        try {
            const project = await context.projects.findOne({
                where: { name: pname },
                include: [{
                    model: context.sections,
                    include: [{
                        model: context.todos
                    }]
                }, {
                    model: context.users
                }]
            })

            if (project == null)
                throw '권한이 없습니다.'

            const members = {}
            for (const user of project.users)
                members[user.id] = user

            const sections = JSON.parse(JSON.stringify(project.sections))
            for (const section of sections) {
                for (const todo of section.todos) {
                    todo.mine = (todo.owner == uid)
                    todo.owner = members[todo.owner]
                }
            }

            return { sections: sections, mine: project.owner == uid }
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async add(uid, sid, title, desc) {

        const t = await sequelize.transaction()
        try {

            const user = await context.users.findOne({
                where: { id: uid },
                include: [
                    {
                        model: context.projects,
                        required: true,
                        include: [{ model: context.sections, where: { id: sid } }]
                    },
                ]
            }, { transaction: t })
            if (user == null)
                throw '권한이 없습니다.'

            const todo = await context.todos.create({
                title: title,
                description: desc,
                section_id: sid,
                owner: uid
            }, { transaction: t })

            await t.commit()

            const raw = JSON.parse(JSON.stringify(todo))
            raw.owner = user
            return raw
        } catch (e) {
            console.error(e)
            t.rollback()
            throw e
        }
    }

    async update(todo, id, uid) {
        const t = await sequelize.transaction()
        try {

            const found = await context.todos.findOne({
                where: { id: id },
                include: [{
                    model: context.users,
                    required: true,
                    where: { id: uid }
                }]
            }, { transaction: t })

            if (found == null)
                throw '권한이 없습니다.'

            await found.update({
                title: todo.title,
                description: todo.desc,
                importance: todo.importance,
                deadline: todo.deadline
            }, { transaction: t })

            await t.commit()
        } catch (e) {
            t.rollback()
            console.error(e)
            throw e
        }
    }

    async remove(id, uid) {
        const t = await sequelize.transaction()
        try {
            const todo = await context.todos.findOne({
                where: { [Op.and]: [{ id: id }, { owner: uid }] }
            }, { transaction: t })
            if (todo == null)
                throw '권한이 없습니다.'

            await context.todos.destroy({
                where: { id: id }
            }, { transaction: t })

            await t.commit()
        } catch (e) {
            t.rollback()
            console.error(e)
            throw e
        }
    }
}

module.exports = Todo