'use strict'
const DI = require('../../lib/DI')
const { verify } = require('../jwt')
const { createError } = require('../../lib/http')
const BEARER_STRING = 'Bearer '
const cloneDeep = require('lodash.clonedeep')

let chatRooms = {}
let chatListenerRooms = {}
const connections = new Map()

const joinRoom = (userId, chatIds, connection) => {
    const rooms =  cloneDeep(chatRooms)
    chatIds.forEach((el) => {
        rooms[el]
            ? rooms[el] = new Set([...Array.from(rooms[el].keys()), userId])
            : rooms[el] = new Set([userId])
    })
    chatRooms = rooms

    connections.set(userId, connection)
}

const leaveRoom = (userId) => {
    const rooms = JSON.parse(JSON.stringify(chatRooms))
    chatRooms = Object.entries(rooms).map(([chatId, users]) =>
        [chatId, new Set(Array.from(users || []).filter((el) => el !== userId))],
    ).reduce((prev, acc) => ({ ...prev, [acc[0]]: acc[1] }), [])

    chatRooms = Object.entries(chatListenerRooms).map(([chatId, users]) =>
        [chatId, new Set(Array.from(users || []).filter((el) => el !== userId))],
    ).reduce((prev, acc) => ({ ...prev, [acc[0]]: acc[1] }), [])


    connections.delete(userId)
}


const joinRoomAsChatsViewer = (userId, chatIds, connection) => {
    const rooms =  cloneDeep(chatListenerRooms)
    chatIds.forEach((el) => {
        rooms[el]
            ? rooms[el] = new Set([...Array.from(rooms[el].keys()), userId])
            : rooms[el] = new Set([userId])
    })
    chatListenerRooms = rooms

    connections.set(userId, connection)
}

const preHandler = (request, reply, done) => {
    const userToken = request.headers.authorization.replace(BEARER_STRING, '')
    const userId =  verify(userToken).id
    if (!userId) reply.code(401).send(createError('Unauthorized'))

    request.body = { ...request.body, userId }

    done()
}


const routes = (fastify, opts, done) => {

    fastify.addHook('preHandler', preHandler)

    const chatService = DI.injectModule('chatService')
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            description: 'chat',
            tags: ['Chat'],
            summary: '',
        },
        handler: async (request, reply) => {
            const headers = {
                'Content-Type': 'text/event-stream',
                Connection: 'keep-alive',
                'Cache-Control': 'no-cache',
            }
            reply.raw.writeHead(200, headers)


        },
        wsHandler: async (connection, request) => {
            const { userId } = request.body

            const chats = await chatService.getUserChats({ userId })

            const chatIds = chats.map((el) => el.id)

            connection.socket.send(JSON.stringify({
                type: 'INITIAL_CHATS',
                data: chats,
            }))

            const ACTIONS = [
                {message: 'createChat', action: chatService.createChat}
            ]

            connection.socket.on('message', (message) => {
                const sentMessage = JSON.stringify(message)
                const { message: messageType, data } = sentMessage
                const action = ACTIONS.find((el) => el.message === messageType)

                if (!action) return connection.socket.send('Error occured')

                action.action({
                    userId,
                    chatRooms,
                    connection,
                    data,
                    connections,
                    chatViewers: chatListenerRooms,
                })
            })

            joinRoomAsChatsViewer(userId, chatIds, connection)

            connection.socket.on('close', () => {
                leaveRoom(userId)
            })
        },
    })

    fastify.route({
        method: 'GET',
        url: '/chats/:chatId',
        handler: async (request, reply) => reply.send('hello'),
        wsHandler: async (connection, request) => {
            const { chatId } = request.params
            const { userId } = request.body

            try {
                const messages  = await chatService.getChatMessages({ chatId, userId })
                connection.socket.send(JSON.stringify({
                    type: 'INITIAL_MESSAGES',
                    data: messages,
                }))
            } catch (e) {
                console.log('error', e)
                connection.socket.close()
            }

            joinRoom(userId, [Number(chatId)], connection)

            const ACTIONS = [
                { message: 'sendMessage', action: chatService.sendMessage },
                { message: 'editMessage', action: chatService.editMessage },
                { message: 'deleteMessage', action: chatService.deleteMessage },
                { message: 'setReadMessages', action: chatService.setReadMessages}
            ]

            connection.socket.on('message', (message) => {
                const sentMessage = JSON.parse(message.toString())

                const { message: messageType, data } = sentMessage

                const action = ACTIONS.find((el) => el.message === messageType)

                if (!action) return connection.socket.send('Error occured')

                action.action({
                    userId,
                    chatId: Number(chatId),
                    chatRooms,
                    connection,
                    data,
                    connections,
                    chatViewers: chatListenerRooms,
                })
            })

            connection.socket.on('close', () => {
                leaveRoom(userId)
            })
        },
    })

    fastify.route({
        method: 'POST',
        url: '/',
        schema: {
            // body: {
            //     $ref: 'chatCreate',
            // },
            // response: {
            //     200: {
            //         $ref: 'chatCreate',
            //     },
            // },
        },
        handler: async ( request, reply ) => {
            const { title, file, userIds: jsonUserIds, userId } = request.body
            const userIds = JSON.parse(jsonUserIds)
            const data = file?.[0]
            const photo = data?.data

            const result = await chatService.createChat({
                title,
                userId,
                userIds,
                image: photo
            })

            reply.send(JSON.stringify({success: true, body: result}))
        }
    })

    fastify.route({
        method: 'POST',
        url: '/add-to-chat',
        schema: {
            // body: {
            //     $ref: 'addToChat',
            // },
            // response: {
            //     200: {
            //         $ref: 'addToChat',
            //     },
            // },
        },
        handler: async ( request, reply ) => {

            try{
                const { chatId, userIds: jsonIds, userId } = request.body

                const userIds = JSON.parse(jsonIds)
                const result = await chatService.addUsersToExistingChat({
                    userId,
                    userIds,
                    chatId: +chatId,
                    connections
                })

                reply.send(JSON.stringify( {success: true, body: result}))
            }catch (e) {
                reply.send(JSON.stringify({success: false, body: new Error('You are not a member of this chat')}))
            }

        }
    })

    //TODO remove tech debt
    fastify.route({
        method: 'GET',
        url: '/users',
        schema: {
            description: 'Get chat users',
            tags: ['Chat', 'User'],
            querystring: {
                type: 'object',
                properties: {
                    take: { type: 'integer' },
                    skip: { type: 'integer' },
                    order: { type: 'string', enum: ['asc', 'desc'] },
                    sort: { type: 'string' },
                    search: { type: 'string' }
                },
                required: ['take', 'skip', 'order', 'sort'],
            },
            response: {
                200: {
                    $ref: 'posts',
                },
            },
        },
        handler: async (request, reply) => {
            const { take, skip, order, sort, search = null } = request.query

            const filter = {
                'first_name': search,
                'last_name': search
            }

            const opts = await chatService.getUsers({take: +take, skip: +skip, order, sort: sort?.length > 0? sort: 'id', filter})

            reply.send(JSON.stringify({success: true, body: opts}))
        }
    })

    fastify.route({
        method: 'PUT',
        url: '/',
        schema: {
            // description: '',
            // body: {
            //     $ref: 'chatUpdate',
            // },
            // response: {
            //     200: {
            //         $ref: 'chatUpdate',
            //     },
            // },
        },
        handler: () => {}
    })

    done()
}

const prefix = '/chat'

module.exports = {
    data: {
        routes,
        prefix,
    },
}
