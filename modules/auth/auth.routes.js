const DI = require('../../lib/DI')
const {AuthorizationError} = require('./auth.errors')

const BEARER_STRING = 'Bearer '

const routes =  (fastify, opts, done) => {

    fastify.route({
        method: 'POST',
        url: '/login',
        schema: {
            description: 'Login',
            tags: ['Auth, User'],
            summary: '',
            body: {
                $ref: 'login',
            },
            response: {
                200: {
                    token: {
                        type: 'string',
                    },
                },
            },
        },
        handler:  async (request, reply) => {
            const userService = DI.injectModule('authService')
            const { ticket, password } = request.body
            const token = await userService.loginUser({ ticket, password })
            if (!token) throw new AuthorizationError('Error while generating coin')
            reply.send(JSON.stringify( {body: {token}, success: true}))
        },
    })

    fastify.route({
        method: 'POST',
        url: '/registration',
        schema: {
            description: 'Registerate',
            tags: ['Auth, User'],
            summary: '',
            response: {
                200: {
                    token: {
                        type: 'string',
                    },
                },
            },
        }, handler: async (request, reply) => {

            const { password, group, email, ticketImage } = request.body

            const data = ticketImage[0]

            const ticketPhoto = await data.data
            const userService = DI.injectModule('authService')
            const token = await userService.createUserWithProfile({
                ticketPhoto,
                password,
                email,
                group,
            })

            reply.send(
                JSON.stringify({
                    body: {
                        token
                    },
                    success: true
                })
            )
        },
    })

    fastify.route({
        method: 'POST',
        url: '/verify',
        schema: {
            description: 'Verify',
            tags: ['Auth, User'],
            summary: '',
            response: {
                200: {
                    description: 'Response',
                    type: 'object',
                    properties: {
                        verified: {
                            type: 'boolean',
                        },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userService = DI.injectModule('authService')
            const isValid = await userService.verify(userToken)
            reply.send(JSON.stringify({ success: true, body: { verified: !!isValid } }))
        },
    })

    done()
}

module.exports = {
    data: {
        routes,
        prefix: '/auth',
    },
}
