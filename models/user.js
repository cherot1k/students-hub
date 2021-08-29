const Sequilize = require('sequelize')
const {DB} = require('../modules/db')
const Profile = require('./profile')

const User =  DB.define('user',{
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
}, {tableName: 'user', timestamps: false})

User.hasOne(Profile)
Profile.belongsTo(User)

module.exports = User