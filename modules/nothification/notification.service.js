const {NOTIFICATION_TYPES} = require('./notification.types')
const {PrismaClient} = require('@prisma/client')
const {DbError} = require('../auth/auth.errors')
const DI = require('../../lib/DI')

const prisma = new PrismaClient();

const {notification, user} = prisma

class NotificationService{
    notifyUser({type, userId, message}){
        if(type === NOTIFICATION_TYPES.INTERNAL){

        }else{

        }
    }

    notifyGroup({type, userIds, message}){

    }

    async sendInternalNotification({userId, message}){
        // SA
        try{
            await notification.create({
                data: {
                    message,
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                }
            })

            await this.sendPushNotifications({userId: [userId], message})
        }catch (e) {
            throw new DbError(`Can't create push notification`)
        }
    }

    async sendPushNotifications({userIds, message}){
        const firebaseService = DI.injectModule('firebaseService')

        const relatedUser = await user.findMany({
            where: {
                id: {
                    in: userIds
                },
                NOT: [
                    {
                        token: null
                    }
                ]
            },
            select: {
                token: true
            }
        })

        const messages = relatedUser.map(el => el.token).map(token => ({token, notification: {title: message}}))

        await firebaseService.sendMessages(messages)
    }

    setReadNotification({userId, notificationIds}){

    }
}

module.exports = {
    module: {
        service: new NotificationService(),
        name: 'notificationService'
    }
}
