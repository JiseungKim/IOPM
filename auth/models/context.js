const Sequelize = require('sequelize')
const appsettings = require('../modules/config')

const sequelize = new Sequelize(appsettings.database.database, appsettings.database.user, appsettings.database.password, { host: appsettings.database.host, dialect: 'mysql' })

const context = {
    sequelize: sequelize,

    users: sequelize.define('users', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uuid: {
            type: Sequelize.STRING(128),
            unique: true,
            allowNull: false
        },
        host: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(64),
            unique: true,
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
        },
        last_login: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        }
    }, { charset: 'utf8', collate: 'utf8_general_ci', timestamps: false })
}

sequelize.sync()
module.exports = context