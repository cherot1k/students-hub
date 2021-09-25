const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_NAME, process.env.POSTGRES_PASSWORD, {
//   host: process.env.POSTGRES_HOSTNAME,
//   dialect: 'postgres',
//   define: {
//     timestamps: false
//   },
//   omitNull: true
// })

const sequelize = new Sequelize(process.env.DATABASE_URL)

module.exports = sequelize