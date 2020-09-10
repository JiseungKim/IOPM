const config = require('../configs/configs.json')
const Sequelize = require('sequelize')
const Team = require('./team_sequelize')

const sequelize = new Sequelize(
    config.database.database,
    config.database.user,
    config.database.password,
    {
        'host':config.database.host,
        'dialect':'mysql'
    }
);

// timestamp 사용하기위함 : https://www.npmjs.com/package/sequelize-mysql-timestamp
const TIMESTAMP = require('sequelize-mysql-timestamp')(sequelize)

const Member = sequelize.define('Member', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    nickname: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    gender: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    phone: {
        type: Sequelize.STRING,
    },
    last_login: {
        type: TIMESTAMP
    },
    created_date: {
        type: TIMESTAMP
    }
})

Member.belongsToMany(Team, { through:'Participation' })

module.exports=Member