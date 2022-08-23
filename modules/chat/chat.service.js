const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const {user, chat, message} = prisma

const DI = require('../../lib/DI')

const getMessagesAndSentToSockets = async ({chatRooms, chatId, connections, data, chatViewers}) => {
    // const chatMessages = await message.findMany({
    //     where: {
    //         chatId
    //     },
    //     include: {
    //         user: {
    //             include: {
    //                 profile: true
    //             }
    //         }
    //     }
    // })

    const chatSubscribers = Array.from( chatRooms[chatId].keys())

    chatSubscribers.forEach(el => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify(data))
    })

    const chatViewerSubscribers = Array.from( chatViewers[chatId].keys())

    const lastChatVersion = await chat.findUnique({
        where: {
            id: chatId
        }
    })

    chatViewerSubscribers.forEach(el => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify({
            type: 'CHAT_UPDATE',
            data: lastChatVersion
        }))
    })

    chatSubscribers.forEach(el => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify(data))
    })
}

class ChatService {
    async getUserChats({userId}){
        const userChats = await user.findUnique({
            where: {
                id: userId
            },
            include: {
                chats: true
            }
        })

        return userChats.chats
    }

    async getChatById(){

    }

    async sendMessage({userId, chatId, chatRooms, connections, data, chatViewers}){

        const createdMessage = await message.create({
            data: {
                chat: {
                    connect: {
                        id: Number(chatId)
                    }
                },
                user: {
                    connect: {
                        id: Number(userId)
                    }
                },
                message: data.message
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        })
        await chat.update({
            where: {
                id: chatId
            },
            data: {
                last_message: data.message
            }
        })

        await getMessagesAndSentToSockets(
            {
                chatRooms,
                chatId,
                connections,
                data: {
                    type: 'NEW_MESSAGE',
                    data: {message: createdMessage, chatId}
                },
                chatViewers
            }
        )
    }

    async editMessage({userId, chatId, chatRooms, connections, data, chatViewers}){
        const editedMessage = await message.update({
            where: {
                userId,
                chatId,
                id: data.id
            },
            data: {
                message: data.message
            }
        })

        await getMessagesAndSentToSockets({chatRooms, chatId, connections, chatViewers})
    }

    async getChatMessages({chatId, userId, connection}){
        const usersChat = await chat.findUnique({
            where: {
                id: Number( chatId)
            },
            include: {
                users: {
                    select: {
                        id: true
                    }
                }
            }
        })

        const isInChat = usersChat.users.map(el => el.id).includes(Number(userId))

        if(!isInChat)  throw new Error('403 Not Allowed')

        const messages = await message.findMany({
            where: {
                chatId: Number(chatId)
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        return messages
    }
}

module.exports = {
    module: {
        service: new ChatService(),
        name: 'chatService'
    }
}
