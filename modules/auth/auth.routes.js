const DI = require('../../lib/DI')
const {createResponse, createError} = require("../../lib/http");
const BEARER_STRING = 'Bearer '

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
            reply.send(createResponse({token}))
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
                const ticketPhoto = await data.toBuffer()
                const userService = DI.injectModule('authService')
                const token = await userService.createUserWithProfile({ticketPhoto, password, email, group})
                reply.send(createResponse( {token}))
            }catch (e){
                console.log('e', e)
              reply.send(createError(e))
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
                const userToken = request.headers.authorization.replace(BEARER_STRING, '')
                const userService = DI.injectModule('authService')
                const isValid = await userService.verify(userToken)
                reply.send(createResponse({verified: !!isValid}))
            }catch (e){
                reply.send(createError(e))
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
