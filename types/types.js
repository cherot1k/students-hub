const  UserSchemas = require( '../types/user')

module.exports = (fastify) => {
    UserSchemas(fastify)
}