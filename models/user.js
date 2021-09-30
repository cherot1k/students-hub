const Sequilize = require('sequelize')
const {DB} = require('../modules/db')
const Profile = require('./profile')

const User =  DB.define('app-users',{
  id: {
    type: Sequilize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  ticket: {
    type: Sequilize.STRING,
    allowNull: false,
    primaryKey: true
  },
  password: {
    type: Sequilize.STRING,
    allowNull: false
  }
}, {tableName: 'app-users', timestamps: false})

User.hasOne(Profile)
Profile.belongsTo(User)

module.exports = User