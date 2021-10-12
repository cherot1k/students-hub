const {createUserWithProfile, loginUser, verify} = require('./auth.service')

module.exports = async (fastify, opts, done) => {
    fastify.route({
        method: "POST",
        url: '/login',
        schema: {
            description: "Login",
            tags: ['Auth, User'],
            summary: '',
            body:{
                $ref: 'login'
            },
            response:{
                200: {
                    token: {
                        type: 'string'
                    }
                }
            }
        },
        handler:  async (request, reply) => {
          try{
            const {ticket, password} = request.body;
            const token = await loginUser({ticket, password})
            reply.send({token})
          }catch (e){
               reply.send(e)
          }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/registration',
        schema:{
            description: "Registerate",
            tags: ['Auth, User'],
            summary: '',
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
            try {
                const {ticket, password, first_name, last_name, university, group, email} = request.body
                const token = await createUserWithProfile({ticket, password, first_name, last_name, university})
                reply.send({token})
            }catch (e){
              reply.send(e)
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/verify',
        schema:{
            description: "Verify",
            tags: ['Auth, User'],
            summary: '',
            body:{
                type: 'object',
                properties: {
                    token:{
                        type: 'string'
                    }
                },
                required: ['token']
            },
            response:{
                200:{
                    description: "Response",
                    type: 'object',
                    properties: {
                        verified: {
                            type: 'boolean'
                        }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            try{
                const {token} = request.body
                const isValid = await verify(token)
                reply.send({verified: isValid})
            }catch (e){
                reply.send(e)
            }
        }
    })
}