const Sequelize = require('sequelize')
const appsettings = require('../modules/config')

const sequelize = new Sequelize(appsettings.database.database, appsettings.database.user, appsettings.database.password, { host: appsettings.database.host, dialect: 'mysql' })
const context = {
    sequelize: sequelize,
    projects: sequelize.define('project', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(128)
        },
        desc: {
            type: Sequelize.STRING(128),
            allowNull: true
        },
        owner: {
            type: Sequelize.INTEGER
        },
        created_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, { charset: 'utf8', collate: 'utf8_general_ci', timestamps: false }),

    sections: sequelize.define('section', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        project_id: {
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING(128)
        },
        created_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, { charset: 'utf8', collate: 'utf8_general_ci', timestamps: false }),

    todos: sequelize.define('todo', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING(256),
        },
        description: {
            type: Sequelize.STRING(512),
        },
        section_id: {
            type: Sequelize.INTEGER
        },
        owner: {
            type: Sequelize.INTEGER
        },
        created_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        importance: {
            type: Sequelize.BOOLEAN,
            defaulValue: false
        },
        deadline: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, { charset: 'utf8', collate: 'utf8_general_ci', timestamps: false }),

    users: sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        uuid: {
            type: Sequelize.STRING(64),
            unique: true,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        nickname: {
            type: Sequelize.STRING(64),
            allowNull: true
        },
        phone: {
            type: Sequelize.STRING(32),
            allowNull: true
        },
        photo: {
            type: Sequelize.STRING(256),
            allowNull: true
        },
        created_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        }
    }, { charset: 'utf8', collate: 'utf8_general_ci', timestamps: false })
}

context.users.hasMany(context.projects, { foreignKey: 'owner' })
context.users.hasMany(context.todos, { foreignKey: 'owner' })
context.users.belongsToMany(context.projects, { through: 'participations', foreignKey: 'user_id' })
context.projects.hasMany(context.sections, { foreignKey: 'project_id' })
context.projects.belongsToMany(context.users, { through: 'participations', foreignKey: 'project_id' })
context.sections.hasMany(context.todos, { foreignKey: 'section_id' })

sequelize.sync()
module.exports = context