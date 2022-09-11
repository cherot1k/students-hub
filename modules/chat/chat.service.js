'use strict'
const { PrismaClient } = require('@prisma/client')
const DI = require('../../lib/DI')
const { formatChat, formatChats, formatChatMessages } = require('./chat.utils')
const prisma = new PrismaClient()
const { user, chat, message, userReadMessage } = prisma

const DEFAULT_IMAGE_URL = 'http://res.cloudinary.com/dts7nyiog/image/upload/v1655124121/users/yylbf1ljyehqigwqaatz.jpg'
// const DI = require('../../lib/DI')

const getMessagesAndSentToSockets = async ({ chatRooms, chatId, connections, data, chatViewers }) => {

    const chatSubscribers = Array.from(chatRooms[chatId].keys())

    chatSubscribers.forEach((el) => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify(data))
    })

    const chatViewerSubscribers = Array.from(chatViewers[chatId].keys())

    const lastChatVersion = await chat.findUnique({
        where: {
            id: chatId,
        },
    })

    chatViewerSubscribers.forEach((el) => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify({
            type: 'CHAT_UPDATE',
            data: lastChatVersion,
        }))
    })

    chatSubscribers.forEach((el) => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify(data))
    })
}

class ChatService {
    async getUserChats({ userId }) {
        const userChats = await user.findUnique({
            where: {
                id: userId,
            },
            include: {
                chats: {
                    include: {
                        users: {
                            include: {
                                profile: true
                            }
                        },
                        roles: true
                    }
                },

            },
        })

        return formatChats( userChats.chats, userId)
    }

    async getChatById() {

    }

    async sendMessage(
        { userId, chatId, chatRooms, connections, data, chatViewers },
    ) {

        const createdMessage = await message.create({
            data: {
                chat: {
                    connect: {
                        id: Number(chatId),
                    },
                },
                user: {
                    connect: {
                        id: Number(userId),
                    },
                },
                message: data.message,
            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        })
        await chat.update({
            where: {
                id: chatId,
            },
            data: {
                last_message: data.message,
            },
        })

        await getMessagesAndSentToSockets(
            {
                chatRooms,
                chatId,
                connections,
                data: {
                    type: 'NEW_MESSAGE',
                    data: { message: createdMessage, chatId },
                },
                chatViewers,
            },
        )
    }

    async editMessage({ userId, chatId, chatRooms, connections, data, chatViewers }) {
        const editedMessage = await message.update({
            where: {
                userId,
                chatId,
                id: data.id,
            },
            data: {
                message: data.message,
            },
        })

        await getMessagesAndSentToSockets({ chatRooms, chatId, connections, chatViewers })
    }

    async getChatMessages({ chatId, userId }) {
        const usersChat = await chat.findUnique({
            where: {
                id: Number(chatId),
            },
            include: {
                users: {
                    select: {
                        id: true,
                    },
                },
            },
        })

        const isInChat = usersChat.users.map((el) => el.id).includes(Number(userId))

        if (!isInChat)  throw new Error('403 Not Allowed')

        const messages = await message.findMany({
            where: {
                chatId: Number(chatId),
            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
                readUsers: true,

            },
        })

        return formatChatMessages(messages)
    }

    async setReadMessages({ data, userId }){
        const {startMessageId, endMessageId} = data
        const list = [...Array(endMessageId + 1 - startMessageId).keys()].map(el => el + startMessageId)

        await userReadMessage.createMany({
            data: list.map(el => ({userId, messageId: el}))
        })

        return true
    }

    async createChat({title, image, userIds, userId}){
        const imageStorage = DI.injectModule('imageStorage')
        const data = image ? await imageStorage.storeImageAndReturnUrl(image) : DEFAULT_IMAGE_URL

        return await chat.create({
            data: {
                title,
                users: {
                    connect: userIds.map(el => ({id: el}))
                },
                imageUrl: data,
                roles: {
                    create: {
                        role: 'ADMIN',
                        user: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                }
            }
        })
    }
}

module.exports = {
    module: {
        service: new ChatService(),
        name: 'chatService',
    },
}
