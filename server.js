require('dotenv').config()
const Types = require('./types/types')
const CorsSettings = require('./config/cors')
const DataSchemas = require('./lib/schemas')
const {fastifyAwilixPlugin} = require("fastify-awilix");
const {loadModule} = require("./lib/loadmodules")
const fastify = require('fastify')({
  logger: true,
})
const {MODULE_PATH} = require('./utils/constants')
const DI = require('./lib/DI')
try{
  (async () => {
    await fastify.register(fastifyAwilixPlugin, {disposeOnClose: true, disposeOnResponse: true})

    DataSchemas(fastify)
    CorsSettings(fastify)
    Types(fastify)
    loadModule({ callback: ({service, name}) => DI.registerModule(name, service), matchPattern: /\.service.js/, filepath: MODULE_PATH, importName: "module"})
    loadModule({callback:  ({routes, prefix}) => fastify.register(routes, {prefix}), matchPattern: /\.routes.js/, filepath: MODULE_PATH, importName: "data"})
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
      exposeRoute: true,
      refResolver: {
        buildLocalReference(json, baseUri, fragment, i) {
          return json.$id || `my-fragment-${i}`
        }
      }
    })

    fastify.listen(process.env.PORT || 2000, '0.0.0.0', function (err){
      if(err) console.log('error',err)
      fastify.log.info(`server listening on ${process.env.PORT}`)
    })

    fastify.ready((err) => {
      if(err) throw err
      //fastify.swagger()
    })
  })()

}catch (e){
  console.log(e)
}


