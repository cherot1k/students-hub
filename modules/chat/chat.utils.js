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
    }
}

const formatChatMessages =
    (messages) => messages.map(formatChatMessage)


const formatChat = (chat, last_message, userId) => {
    return {
        id: chat.id,
        title: chat.title,
        last_message,
        imageUrl: chat.imageUrl,
        role: chat?.roles.find(el => el.userId === userId)?.role || null,
        members: chat.users,
    }
}

const formatChats = (chats, userId) => chats.map(el => formatChat(el, null, userId))

module.exports = {
    formatChatMessages,
    formatChat,
    formatChatMessage,
    formatChats
}
