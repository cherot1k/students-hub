require('dotenv').config()
const Types = require('./types/types')
const Router = require('./lib/router')
const CorsSettings = require('./config/cors')
const DataSchemas = require('./lib/schemas')
const fastify = require('fastify')({
  logger: true
})

try{
  DataSchemas(fastify).then(r => console.log(r))
  CorsSettings(fastify)
  Types(fastify)
  Router(fastify).then(r => {
    fastify.register(require('fastify-swagger'), {
      routePrefix: '/documentation',
      swagger: {
        info: {
          title: 'Test swagger',
          description: 'Testing the Fastify swagger API',
          version: '0.1.0'
        },
        externalDocs: {
          url: 'https://swagger.io',
          description: 'Find more info here'
        },
        host: 'localhost',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      exposeRoute: true
    })
  })

  fastify.route({
    method: "GET",
    url: "/",
    handler: (request, reply) => {
      reply.send({hello:'world'})
    }
  })

  fastify.listen(process.env.PORT || 5000, '0.0.0.0', function (err){
    if(err) console.log(err)
    fastify.log.info(`server listening on ${process.env.PORT}`)
    fastify.swagger()
  })
}catch (e){
  console.log(e)
}


