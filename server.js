require('dotenv').config()
const Types = require('./types/types')
const Router = require('./lib/router')
const CorsSettings = require('./config/cors')
const {DB} = require('./modules/db')
const DataSchemas = require('./lib/schemas')
const fastify = require('fastify')({
  logger: true
})

try{
  console.log(process.env)
  DB.authenticate().then(() => console.log('database connected'))
  DataSchemas(fastify).then(r => console.log(r))
  CorsSettings(fastify)
  Types(fastify)
  Router(fastify).then(r => console.log(r))

  fastify.listen(process.env.PORT, function (err){
    if(err) console.log(err)
    fastify.log.info(`server listening on ${process.env.PORT}`)
  })
}catch (e){
  console.log(e)
}


