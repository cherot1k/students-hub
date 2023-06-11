'use strict'
const { PrismaClient } = require('@prisma/client')
const DI = require('../../lib/DI')
const {formatChatMessage} = require("./chat.utils");
const { formatChat, formatChats, formatChatMessages } = require('./chat.utils')
const prisma = new PrismaClient()
const { user, chat, message, userReadMessage } = prisma

const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dts7nyiog/image/upload/v1680441254/chat-default_uf76x6.jpg'
const DEFAULT_MESSAGE_DEBOUNCE = 10000

const sendReletedChatUsers = (message, userIds, connections) => {
    userIds.forEach((id) => {
        const userDuplex = connections.get(id)

        if(!userDuplex) return

        userDuplex.socket.send(JSON.stringify(message))
    })
}

const getMessagesAndSentToSockets = async ({ chatRooms, chatId, connections, data, chatViewers }) => {
    const firebaseService = DI.injectModule('firebaseService')

    const chatSubscribers = Array.from(chatRooms[chatId].keys())

    const subs = chatViewers?.[chatId]? Array.from(chatViewers?.[chatId]) : []

    const chatViewerSubscribers = subs

    const lastChatVersion = await chat.findUnique({
        where: {
            id: chatId,
        },
        include: CHAT_DEFAULT_INCLUDE
    })

    chatViewerSubscribers.forEach((el) => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify({
            type: 'CHAT_UPDATE',
            data: formatChat(lastChatVersion),
        }))
    })

    chatSubscribers.forEach((el) => {
        const connection = connections.get(el)
        connection.socket.send(JSON.stringify( { type: 'NEW_MESSAGE', data: data.data}))
    })


    const fbUsers = lastChatVersion.users.map(el => ({token: el.token, id: el.id})).filter(el => !!el.token)

   fbUsers.map(el => {
       const message = {
           token: el.token,
           data: { type: data.type, data: JSON.stringify(data.data)},
           notification: { title: 'New messages received' },
       }

       firebaseService.sendMessagesWithDebounce(message, el.id, DEFAULT_MESSAGE_DEBOUNCE)
   })
}

const CHAT_DEFAULT_INCLUDE = {
      users: {
          select: {
              id: true,
              ticket: true,
              token: true,
              profile: {
                  select: {
                      email: true,
                      imageUrl: true,
                      first_name: true,
                      last_name: true,
                      groupId: true
                  }
              },
              createdAt: true,
              updatedAt: true
          }
      },
      roles: true,
      messages: {
          orderBy: {
              id: 'desc'
          },
          take: 1,
          include: {
              readUsers: true,
              user: {
                  select: {
                      id: true,
                      ticket: true,
                      profile: {
                          select: {
                              email: true,
                              imageUrl: true,
                              first_name: true,
                              last_name: true,
                              groupId: true
                          }
                      }
                  }
              },
          }
      },
  }

class ChatService {
    async getUserChats({ userId }) {
        const userChats = await user.findUnique({
            where: {
                id: userId,
            },
            include: {
                chats: {
                    include: CHAT_DEFAULT_INCLUDE,
                    orderBy: {
                        updatedAt: 'desc'
                    }
                }
            },
        })

        return formatChats( userChats.chats, userId)
    }

    async getChatById() {

    }

    async sendMessage(
        { userId, chatId, chatRooms, connections, data, chatViewers },
    ) {

        let image = data?.image

        const body = {
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
        }

        if(image){
            const imageStorage = DI.injectModule('imageStorage')
            try{
                body.image = await imageStorage.uploadBase64( 'data:image/png;base64,' + image)
            }catch (e) {
                console.log('e', e)
            }
        }

        const createdMessage = await message.create({
            data: body,
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
                readUsers: true
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
                    data: { message: formatChatMessage(createdMessage) , chatId },
                },
                chatViewers,
            },
        )
    }

    async editMessage({ userId, chatId, chatRooms, connections, data, chatViewers }) {
        const currentMessage = await message.findUnique({where: {id: data.id}})

        if(currentMessage.userId !== userId || currentMessage.chatId !== chatId) return

        const editedMessage = await message.update({
            where: {
                id: data.id,
            },
            data: {
                message: data.message,

            },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
                readUsers: true
            },
        })

        await getMessagesAndSentToSockets({ chatRooms, chatId, connections, chatViewers, data: editedMessage })
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
            orderBy: {
                createdAt: 'desc'
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
        try{
            const {startMessageId, endMessageId} = data
            const list = [...Array(endMessageId + 1 - startMessageId).keys()].map(el => el + startMessageId)

            await userReadMessage.createMany({
                data: list.map(el => ({userId, messageId: el}))
            })
        }catch (e) {
            console.log(e)
        }

        return
    }

    async createChat({title, image, userIds, userId}){
        const firebaseService = DI.injectModule('firebaseService')

        const imageStorage = DI.injectModule('imageStorage')
        const data = image ? await imageStorage.storeImageAndReturnUrl(image) : DEFAULT_IMAGE_URL

        const created_chat = await chat.create({
            data: {
                title,
                users: {
                    connect: userIds.concat([userId]).map(el => ({id: el}))
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
            },
            include: CHAT_DEFAULT_INCLUDE

        })

        const formattedChat = formatChat(created_chat)

        const fbMessages = created_chat.users.map(el => el.token).filter(el => !!el).map(el => ({
            data: { chat: JSON.stringify( formattedChat) },
            notification: { title: 'New chat member' },
            token: el
        }))


        try {

            await firebaseService.sendMessages(fbMessages)
        }catch (e) {
            console.log('error sending ', e)
        }

        return formattedChat
    }

    async addUsersToExistingChat({userIds, userId, chatId, connections}){
        const firebaseService = DI.injectModule('firebaseService')

        const foundChat = await chat.findFirst({
            where:{
                id: chatId,
                users: {
                    some: {
                        id: userId
                    }
                }
            },
        })

        if(!foundChat) throw new Error('You are not have permission')

        const updatedChat = await chat.update({
            where: {
                id: chatId
            },
            data: {
                users: {
                    connect: userIds.map(el =>
                      ({
                          id: el
                      })
                    )
                }
            },
            include: CHAT_DEFAULT_INCLUDE
        })

        const formattedChat = formatChat(updatedChat)

        const message = {
            type: 'CHAT_UPDATED',
            data: formattedChat
        }

        sendReletedChatUsers(
          message,
          updatedChat.users.map(el => el.id),
          connections
        )


        const fbMessages = updatedChat.users.map(el => el.token).filter(el => !!el).map(el => ({
            data: { chat: JSON.stringify( formattedChat) },
            notification: { title: 'New chat member' },
            token: el
        }))

        await firebaseService.sendMessages(fbMessages)

        return formattedChat
    }


    async getUsers(opts){
        const userService = DI.injectModule('userService')
        return await userService.getUsers(opts)
    }

    async chatUpdate({title, image, chatId, connections}){
        let imageUrl = null
        const imageService = DI.injectModule('imageStorage')

        if(image){
            imageUrl = await imageService.storeImageAndReturnUrl(image)
        }

        const data = {}

        if(imageUrl) data.imageUrl = imageUrl

        if(title) data.title = title

        const updatedChat = await chat.update({
            where: {
                id: chatId
            },
            data: data,
            include: CHAT_DEFAULT_INCLUDE
        })

        sendReletedChatUsers(
          message,
          updatedChat.users.map(el => el.id),
          connections
        )

        return formatChat(updatedChat)
    }
}

module.exports = {
    module: {
        service: new ChatService(),
        name: 'chatService',
    },
}
