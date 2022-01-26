require('dotenv').config()
const Types = require('./types/types')
const CorsSettings = require('./config/cors')
const DataSchemas = require('./lib/schemas')
const {loadModule} = require("./lib/loadmodules")
const fastify = require('fastify')({
  logger: true,
})
const fastify_swagger = require('fastify-swagger')
const {MODULE_PATH} = require('./utils/constants')
const DI = require('./lib/DI')
try{
  fastify.server.keepAliveTimeout = 90000;
  (async () => {
    fastify.register(require('fastify-multipart'), {
      // addToBody: true
    })
    fastify.register(fastify_swagger, {
      routePrefix: '/doc',
      swagger: {
        info: {
          title: 'Students-hub api',
          description: 'Wtf r u doing',
          version: '2.2.8'
        },
        host: process.env.HOST_URL,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      exposeRoute: true,
      // refResolver: {
      //   buildLocalReference(json, baseUri, fragment, i) {
      //     return json.$id || `my-fragment-${i}`
      //   }
      // }
    })
    DataSchemas(fastify)
    CorsSettings(fastify)
    Types(fastify)
    loadModule({ callback: ({service, name}) => DI.registerModule(name, service), matchPattern: /\.service.js/, filepath: MODULE_PATH, importName: "module"})
    loadModule({callback:  ({routes, prefix}) => fastify.register(routes, {prefix}), matchPattern: /\.routes.js/, filepath: MODULE_PATH, importName: "data"})
    fastify.get('/', {},(request, reply) => reply.send('hellos, world') )


    fastify.listen(process.env.PORT || 2000, '0.0.0.0', function (err){
      if(err) console.log('error',err)
      fastify.log.info(`server listening on ${process.env.PORT}`)
    })

    fastify.ready((err) => {
      if(err) throw err
      fastify.swagger()
    })
  })()

}catch (e){
  console.log(e)
}


