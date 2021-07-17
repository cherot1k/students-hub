module.exports = async (fastify, opts, done) => {
    fastify.addSchema({
        $id: 'login',
        type: 'object',
        properties: {
            login: {type: 'string'},
            password: {type: 'string'}
        }
    })

    fastify.route({
        method: "POST",
        url: '/',
        schema: {
            body:{
                $ref: 'login'
            },
            response:{
                200: {
                    user: {$ref: 'login'}
                }
            }
        },
        handler:  (request, reply) => {
            // reply.send( {users:[{id: 2, login: 'dder255t@gmail.com', role: 'ADMIN'}, {id: 3, login: 'dder255t@gmail.com', role: 'ADMIN'} ]})
            console.log(22)
            const {login, password} = request.body;
            reply.send( {login, password} )
        }
    })

    fastify.route({
        method: "GET",
        url: '/',
        schema: {},
        handler:  (request, reply) => {
            reply.send( 'hello world')
        }
    })

    done()
}