'use strict'
const { NOTIFICATION_TYPES } = require('./notification.types')
const { PrismaClient } = require('@prisma/client')
const { DbError } = require('../auth/auth.errors')
const DI = require('../../lib/DI')

const prisma = new PrismaClient()

const { notification, user } = prisma

class NotificationService {
    notifyUser({ type, userId, message }) {
        if (type === NOTIFICATION_TYPES.INTERNAL) {

        } else {

        }
    }

    async getAllNotifications(userId){
        return await notification.findMany({
            where: {
                userId
            }
        })
    }

    notifyGroup({ type, userIds, message }) {

    }

    async sendInternalNotification({ userIds, message }) {
        const formData = userIds.map(el => ({
            userId: el,
            message
        }))
        await notification.createMany({
            data: formData
        })
    }

    async sendPushNotifications({ userIds, message }) {
        const firebaseService = DI.injectModule('firebaseService')

        await notification.createMany({
            data: userIds.map(el => ({
                user: {
                    connect: {
                        id: el,
                    },
                },
                message
            }))
        })

        const relatedUser = await user.findMany({
            where: {
                id: {
                    in: userIds,
                },
                NOT: [
                    {
                        token: null,
                    },
                ],
            },
            select: {
                token: true,
            },
        })

        const messages =
            relatedUser
                .map((el) => el.token)
                .map((token) => ({ token, notification: { title: message } }))

        if(messages.length > 0) {
            await firebaseService.sendMessages(messages)
        }
    }

    // setReadNotification({ userId, notificationIds }) {
    //
    // }

    async getUserNotification(){

    }
}

module.exports = {
    module: {
        service: new NotificationService(),
        name: 'notificationService',
    },
}
