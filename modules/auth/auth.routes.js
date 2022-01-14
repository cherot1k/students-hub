const DI = require('../../lib/DI')

const routes =  (fastify, opts, done) => {
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
            const userService = DI.injectModule('authService')
            const {ticket, password} = request.body;
            const token = await userService.loginUser({ticket, password})
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
                const userService = DI.injectModule('authService')
                const {ticket, password, first_name, last_name, university, group, email} = request.body
                const token = await userService.createUserWithProfile({ticket, password, first_name, last_name, university, group, email})
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
                const userService = DI.injectModule('authService')
                const {token} = request.body
                const isValid = await userService.verify(token)
                reply.send({verified: isValid})
            }catch (e){
                reply.send(e)
            }
        }
    })

    done();
}

module.exports = {
    data: {
        routes,
        prefix: '/auth'
    }
}
