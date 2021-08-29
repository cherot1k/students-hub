const Sequlize = require('sequelize')
const {DB} = require('../modules/db')

const Profile =  DB.define('profile',{
  id: {
    type: Sequlize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  university: {
    type: Sequlize.STRING,
    allowNull: false
  },
  group: {
    type: Sequlize.STRING,
    allowNull: true
  },
  first_name: {
    type: Sequlize.STRING,
    allowNull: false
  },
  last_name: {
    type: Sequlize.STRING,
    allowNull: false
  },
  photo: {
    type: Sequlize.STRING,
    allowNull: true
  },
  email:{
    type: Sequlize.STRING,
    allowNull: true
  }

}, {tableName: 'profile', timestamps: false})


module.exports = Profile