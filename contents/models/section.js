
const context = require('./context')
const { Op } = require('sequelize')
const { sequelize } = require('./context')

// TODO: 정규식

class Project {

    async find(id) {
        try {
            return await context.sections.findOne({
                where: { id: id },
                include: [{ model: context.todos }]
            })
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async from_project(uid, pid) {
        try {
            const project = await context.projects.findOne({
                where: { [Op.and]: [{ id: pid }, { owner: uid }] },
                include: [{ model: context.sections }]
            })

            return project.sections
        } catch (err) {
            throw err
        }
    }

    async add(name, uid, pname) {
        const t = await sequelize.transaction()
        try {
            const project = await context.projects.findOne({
                where: { [Op.and]: [{ name: pname }, { owner: uid }] },
                include: [{ model: context.sections, required: false }]
            })

            if (project == null)
                throw '권한이 없습니다.'

            for (const x of project.sections) {
                if (x.name == name)
                    throw '이미 존재합니다.'
            }

            const created = await context.sections.create({
                project_id: project.id,
                name: name
            }, { transaction: t })

            await t.commit()
            return created.id
        } catch (e) {
            console.error(e)
            t.rollback()
            throw e
        }
    }

    async update(id, section, uid, pid) {

        const t = await sequelize.transaction()
        try {

            const project = await context.projects.findOne({
                where: { id: pid },
                include: [{ model: context.sections }]
            }, { transaction: t })

            if (project == null)
                throw '프로젝트가 없습니다.'

            if (project.owner != uid)
                throw '관리자가 아닙니다.'

            if (project.sections.length == 0)
                throw '섹션이 없습니다.'

            for (const x of project.sections) {
                if (x.id == id)
                    continue

                if (x.name == section.name)
                    throw '이미 존재하는 이름입니다.'
            }

            await context.sections.update({
                name: section.name
            }, {
                where: { id: id }
            }, { transaction: t })

            await t.commit()
            return updated
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    async remove(id, uid) {
        const t = await sequelize.transaction()
        try {

            const project = await context.projects.findOne({
                where: { owner: uid },
                include: [{ model: context.sections, where: { id: id } }]
            }, { transaction: t })

            if (project == null)
                throw '권한이 없습니다.'

            await context.sections.destroy({ where: { id: id } }, { transaction: t })
            await t.commit()

        } catch (e) {
            console.error(e)
            throw e
        }
    }
}

module.exports = Project