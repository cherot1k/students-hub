const {createUserWithProfile, loginUser} = require('./auth.service')

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
            description: "Register",
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
            const {ticket, password, first_name, last_name, university, group, email} = request.body
            const token = await createUserWithProfile({ticket, password, first_name, last_name, university})
            reply.send({token})
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
                    description: "Response",
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