'use strict'
const DI = require('../../lib/DI')
const { verify } = require('../jwt')
const { createResponse, createError } = require('../../lib/http')
const BEARER_STRING = 'Bearer '

const routes = (fastify, opts, done) => {
    const eventService = DI.injectModule('eventService')
    fastify.route({
        method: 'POST',
        url: '/',
        schema: {
            description: 'Create event',
            tags: ['Events'],
            summary: '',
            body: {
                $ref: 'postEvent',
            },
            response: {
                200: {
                    event: {
                        $ref: 'event',
                    },
                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization
                    .replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = { ...request.body, userId }
            done()
        },
        handler:  async (request, reply) => {
            try {
                const {
                    name,
                    date,
                    userId,
                    membersId,
                    status,
                    title,
                    address,
                } = request.body

                const event =
                    await eventService.createEvent({
                        name,
                        date,
                        organizerId: userId,
                        membersId,
                        status,
                        title,
                        address,
                    })
                reply.send(createResponse({ event }))
            } catch (e) {
                reply.send(createError(e))
            }
        },
    })

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            description: 'Get events',
            tags: ['Events'],
            summary: '',
            querystring: {
                type: 'object',
                properties: {
                    take: { type: 'integer' },
                    skip: { type: 'integer' },
                    order: { type: 'string', enum: ['asc', 'desc'] },
                    sort: { type: 'string' },
                },
                required: ['take', 'skip', 'order', 'sort'],
            },
            response: {
                200: {
                    event: {
                        $ref: 'event',
                    },
                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userId = verify(userToken)?.id
            if (!userId) reply.code(401).send(createError('Unauthorized'))

            const { take, skip, sort, order, filter } = request.query
            const queryBuilder = DI.injectModule('query-builder')
            const includeObject = {
                where: {
                    organizerId: userId,
                },
                include: {
                    members: true,
                },
            }

            const query =
                queryBuilder
                    .buildQuery({
                        sort,
                        order,
                        skip: Number(skip),
                        take: Number(take),
                        includeObject,
                        AND: filter ? JSON.parse(filter) : {},
                    })
            request.data = query
            done()
        },
        handler:  async (request, reply) => {
            try {
                const data =
                    await eventService.getEvents({
                        filterObject: request.data,
                    })
                reply.send(createResponse(data))
            } catch (e) {
                reply.send(e)
            }
        },
    })

    fastify.route({
        method: 'GET',
        url: '/:id',
        schema: {
            description: 'Get event',
            tags: ['Events'],
            summary: '',
            response: {
                200: {
                    event: {
                        $ref: 'event',
                    },
                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userId = verify(userToken)?.id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = { ...request.body, userId }
            done()
        },
        handler:  async (request, reply) => {
            try {
                const { userId } = request.body
                const id = request.params.id
                reply.send(
                    createResponse(
                        await eventService.getEvent({ userId, id }),
                    ),
                )
            } catch (e) {
                reply.send(createError(e))
            }
        },
    })

    fastify.route({
        method: 'PUT',
        url: '/event',
        schema: {
            description: 'Update event',
            tags: ['Events'],
            body: {
                $ref: 'updateEvent',
            },
            response: {
                200: {
                    $ref: 'event',
                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userId = verify(userToken)?.id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = { ...request.body, userId }
            done()
        },
        handler: async (request, reply) => {
            const data = request.body
            const userId = data.userId
            delete data.userId
            reply.send(
                createResponse(
                    await eventService.updateEvent(data, userId),
                ),
            )
        },
    })

    fastify.route({
        method: 'DELETE',
        url: '/event',
        schema: {
            description: 'Delete post',
            tags: ['Events'],
            querystring: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                    },
                },
                required: ['id'],
            },
            response: {
                200: {

                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userId = verify(userToken)?.id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = { ...request.body, userId }
            done()
        },
        handler: async (request, reply) => {
            const { id, userId } = request.query
            await eventService.deleteEvent({ id, userId })
            reply.send(createResponse({}))
        },
    })

    fastify.route({
        method: 'PATCH',
        url: '/connect',
        schema: {
            description: 'Patch event',
            tags: ['Events'],
            response: {
                200: {

                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userId = verify(userToken)?.id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = { ...request.body, userId }
            done()
        },
        handler: async (request, reply) => {
            const { userId, eventId } = request.body
            await eventService.connectUsersToEvent({ userId, eventId })
            reply.send(createResponse({}))
        },
    })

    fastify.route({
        method: 'PATCH',
        url: '/disconnect',
        schema: {
            description: 'Patch event',
            tags: ['Events'],
            response: {
                200: {

                },
            },
        },
        preHandler: (request, reply, done) => {
            const userToken =
                request.headers.authorization.replace(
                    BEARER_STRING,
                    '',
                )
            const userId = verify(userToken)?.id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = { ...request.body, userId }
            done()
        },
        handler: async (request, reply) => {
            const { userId, eventId } = request.body
            await eventService.disconnectUserFromEvent({ userId, eventId })
            reply.send(createResponse({}))
        },
    })

    done()
}

const prefix = '/events'

module.exports = {
    data: {
        routes,
        prefix,
    },
}
