const cors = require('fastify-cors')
module.exports = (fastify, opts, done) => {
  fastify.register(cors, {
    origin: ['localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
  })

}