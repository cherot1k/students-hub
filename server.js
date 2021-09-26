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
  DB.authenticate().then(() => console.log('database connected'))
  DataSchemas(fastify).then(r => console.log(r))
  CorsSettings(fastify)
  Types(fastify)
  Router(fastify).then(r => console.log(r))

  fastify.route({
    method: "GET",
    url: "/",
    handler: (request, reply) => {
      reply.send({hello:'world'})
    }
  })

  fastify.listen(process.env.PORT || 5000, function (err){
    if(err) console.log(err)
    fastify.log.info(`server listening on ${process.env.PORT}`)
  })
}catch (e){
  console.log(e)
}


