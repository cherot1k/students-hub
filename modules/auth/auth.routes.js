const {createUserWithProfile, loginUser} = require('./auth.service')

module.exports = async (fastify, opts, done) => {
    fastify.route({
        method: "POST",
        url: '/login',
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
        handler:  async (request, reply) => {
          try{
            const {ticket, password} = request.body;
            reply.send(await loginUser({ticket, password}))
          }catch (e){
               reply.send(e)
          }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/registration',
        schema:{
            body:{
                $ref: 'registration'
            },
            response: {
                200: {
                    token: {
                        type: 'string'
                    }
                }
            }
        },handler: async (request, reply) => {
            const {ticket, password, first_name, last_name, university} = request.body
            const user = await createUserWithProfile({ticket, password, first_name, last_name, university})
            console.log(user)
            reply.send(JSON.stringify({ ticket, password, first_name, last_name, university}))
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

    fastify.route({
        method: 'POST',
        url: '/verify',
        schema:{
            body:{
                type: 'object',
                properties: {
                    ticket: {
                        type: 'string',
                    },
                    password: {
                        type: 'string'
                    }
                },
                required: ['ticket', 'password']
            },
            response:{
                200:{
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const {ticket, password} = request.body

            console.log(hashedPassword.toString('hex'))
            reply.send({ticket, password:hashedPassword})
        }
    })
}