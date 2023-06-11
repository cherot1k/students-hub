const DI = require('../../lib/DI')
const {verify} = require('../jwt')
const {createError} = require('../../lib/http')

const BEARER_STRING = 'Bearer '

const preHandler = (request, reply, done) => {
    const userToken = request.headers.authorization.replace(BEARER_STRING, '')
    const userId = verify(userToken).id
    if (!userId) reply.code(401).send(createError('Unauthorized'))

    request.body = { ...request.body, userId }

    done()
}

const routes = (fastify, opts, done) => {
    fastify.addHook('preHandler', preHandler)

    const notificationService = DI.injectModule('notificationService')

    fastify.route({
        method: 'GET',
        url: '/',
        handler: async(req, reply) => {
            const {userId} = req.body
            const notifications = await notificationService.getAllNotifications(userId)

            reply.send(JSON.stringify({success: true, body: notifications}))
        }
    })


    done()
}

const prefix = '/notifications'

module.exports = {
    data: {
        routes,
        prefix,
    },
}
