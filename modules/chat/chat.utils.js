const formatChatMessage = (message) => {
    return {
        id: message.id,
        author: {
            id: message.user.id,
            first_name: message.user.profile.first_name,
            last_name: message.user.profile.last_name,
            imageUrl: message.user.profile.imageUrl
        },
        userReadIds: message.readUsers.map(el => el.userId),
        message: message.message,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        image: message?.image
    }
}

const formatChatMessages =
    (messages) => messages.map(formatChatMessage)


const formatChat = (chat, last_message, userId) => {
    return {
        id: chat.id,
        title: chat.title,
        last_message: chat.messages?.[0]?{
            text: chat.messages[0].message,
            isMessageRead: chat.messages[0].readUsers.map(el => el.userId).includes(userId),
            createdAt: chat.messages[0]?.createdAt,
            updatedAt: chat.messages[0]?.updatedAt,
            deletedAt: null,
            user: {
                ...chat.messages[0].user.profile,
                firstName: chat.messages[0].user.profile.first_name,
                lastName: chat.messages[0].user.profile.last_name,
                id: chat.messages[0].user.id,
                ticket: chat.messages[0].user.ticket,
            },
            id: chat.messages[0].id,

        } : null,
        imageUrl: chat.imageUrl,
        role: chat?.roles.find(el => el.userId === userId)?.role || null,
        members: chat.users,
        deletedAt: null
    }
}

const formatChats = (chats, userId) => chats.map(el => formatChat(el, null, userId))

module.exports = {
    formatChatMessages,
    formatChat,
    formatChatMessage,
    formatChats,
}


