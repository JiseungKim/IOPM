const config = require('../configs/configs.json')
const Sequelize = require('sequelize')
const Member = require('./member_sequelize')

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

const Team = sequelize.define('Team', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    owner: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    created_date: {
        type: TIMESTAMP
    }
})

Team.belongsToMany(Member, { through:'Participation' })

module.exports=Team