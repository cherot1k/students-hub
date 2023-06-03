const Types = require('./types/types')
const CorsSettings = require('./config/cors')
const DataSchemas = require('./lib/schemas')
const {loadModule} = require("./lib/loadmodules")
const fastify_swagger = require('fastify-swagger')
const {MODULE_PATH} = require('./utils/constants')
const DI = require('./lib/DI')
const { createResponse, createError } = require('./lib/http')

const registerContextRoutes = (server) => {
  return ({routes, prefix}) => {
    server.register(async function ctx(context){
      context.register(routes, {prefix})
    })
  }
}


const createServer = async () => {
      const fastify = require('fastify')({
          logger: true,
          ignoreTrailingSlash: true,
      })

      fastify.register(require('@fastify/websocket'), {
        options: { maxPayload: 1048576 }
      })
      const regRoute = registerContextRoutes(fastify)

      fastify.register(require('fastify-multipart'), {
        addToBody: true
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
      })

      DataSchemas(fastify)
      CorsSettings(fastify)
      Types(fastify)
      loadModule({ callback: ({service, name}) => DI.registerModule(name, service), matchPattern: /\.service.js/, filepath: MODULE_PATH, importName: "module"})
      loadModule({callback:  regRoute, matchPattern: /\.routes.js/, filepath: MODULE_PATH, importName: "data"})

      fastify.addHook('preHandler', (request, reply, done) => {
        request.log.info({body: JSON.stringify( request.body), query: JSON.stringify(request.query)})
          done()
      })

      fastify.addHook('onSend', (request, reply, payload, done) => {
        const parsedPayload = JSON.parse(payload)
        request.log.info({body: payload})

        done( null, parsedPayload?.success? createResponse(parsedPayload?.body): createError(parsedPayload?.body))
      })

      fastify.setErrorHandler(function(err, req, reply) {
          reply.code(err?.code || 500).send(JSON.stringify({success: false, body: err.message}))
      });

      fastify.ready((err) => {
        if(err) throw err
        fastify.swagger()
      })

      return fastify

}

module.exports = { createServer }




