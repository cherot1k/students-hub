
module.exports =
     async (fastify, opts, done) => {
         fastify.addSchema({
             $id: 'users',
             type: 'array',
             items:{ $ref: 'user' }
         })

         fastify.addSchema({
             $id: 'user',
             type: 'object',
             properties: {
                 id: {type: 'number'},
                 login: {type: 'string'},
                 role: {type: 'string'}
             }
         })

        fastify.route({
            method: "GET",
            url: '/',
            schema: {
                response:{
                    200: {
                        users: {$ref: 'users'}
                    }
                }
            },
            handler:  (request, reply) => {
                reply.send( {users:[{id: 2, login: 'dder255t@gmail.com', role: 'ADMIN'}, {id: 3, login: 'dder255t@gmail.com', role: 'ADMIN'} ]})
            }
        })
         done()
    }
