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
            if(!token) reply.code(401).send()
            // reply.send({token})
            reply.send(JSON.stringify({successful: true, message: "Successful", data:  {token}}))
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
            // body:{
                // $ref: 'registration'
            // },
            response: {
                200: {
                    token: {
                        type: 'string'
                    }
                }
            }
        },handler: async (request, reply) => {
            try {
                const data = await request.file()
                const {password, group, email} = Object.values(data.fields).reduce((prev, curr) => {
                    return {...prev, [curr.fieldname]: curr.value}
                },Object.create(null))
                console.log(data.fields)
                const ticketPhoto = await data.toBuffer()
                const userService = DI.injectModule('authService')
                const token = await userService.createUserWithProfile({ticketPhoto, password, email, group})
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
