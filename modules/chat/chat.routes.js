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
        [chatId, new Set(Array.from(users).filter((el) => el !== userId))],
    ).reduce((prev, acc) => ({ ...prev, [acc[0]]: acc[1] }), [])

    chatRooms = Object.entries(chatListenerRooms).map(([chatId, users]) =>
        [chatId, new Set(Array.from(users).filter((el) => el !== userId))],
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

    const chatService = DI.injectModule('chatService')
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            description: 'chat',
            tags: ['Chat'],
            summary: '',
        },
        preHandler,
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
        preHandler,
        handler: async (request, reply) => reply.send('hello'),
        wsHandler: async (connection, request) => {
            const { chatId } = request.params
            const { userId } = request.body

            try {
                const messages  = await chatService.getChatMessages({ chatId, userId })
                connection.socket.send(JSON.stringify({
                    type: 'INITIAL_MESSAGES',
                    messages,
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
        preHandler,
        handler: async ( request, reply ) => {
            const { title, file, userIds: jsonUserIds, userId } = request.body
            const userIds = JSON.parse(jsonUserIds)
            const data = file[0]
            const photo = data?.data

            const result = await chatService.createChat({
                title,
                userId,
                userIds,
                image: photo
            })

            reply.send(2)
        }
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
