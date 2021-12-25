const cors = require('fastify-cors')
module.exports = (fastify) => {
  fastify.register(cors, {
    origin: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
  })

}
