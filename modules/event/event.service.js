'use strict'
const { PrismaClient } = require('@prisma/client')
const { event, user } = new PrismaClient()
const DI = require('../../lib/DI')
class EventService {
    async getEvents({ filterObject }) {
        try {
            return await event.findMany(filterObject)
        } catch (e) {
            console.log('error', e)
        }
    }

    async getEvent({ id, userId }) {
        try {
            const data = await event.findUnique({
                where: {
                    id: Number(id),
                    // organizer: {
                    //     id: Number(userId),
                    // },
                },
            })
            return data
        } catch (e) {
            console.log('error', e)
        }
    }

    async createEvent({
        name,
        date,
        organizerId,
        membersId,
        status,
        title,
        address,
    }) {
        try {
            return await event.create({
                data: {
                    name,
                    date: new Date(date),
                    status,
                    title,
                    address,
                    organizer: {
                        connect: {
                            id: organizerId,
                        },
                    },
                    members: {
                        create: membersId.map((el) => el ? {
                            user: {
                                connect: {
                                    id: el,
                                },
                            },
                        } : { user: null }),
                    },
                },
            })
        } catch (e) {
            console.log('error', e)
        }
    }

    async updateEvent(data, userId) {
        const notificationService = DI.injectModule('notificationService')
        const validObject = Object.create(null)

        Object.entries(data).forEach(([key, value]) => {
            if (value && key !== 'id') validObject[key] = value
        })


        const updatedEvent = await event.updateMany({
            where: {
                id: data.id,
                organizerId: userId,
            },
            data: validObject,
        })

        const events = await event.findMany({
            where: {
                id: data.id,
            },
            include: {
                members: true
            }
        })

        const userIds = events?.members?.map((el) => el.id) || []

        await notificationService
            .sendPushNotifications({
                userIds,
                message:
                    `Event ${updatedEvent.id} has been updated,` +
                    'please check out new information',
            })

        return events
    }

    async deleteEvent({ id, userId }) {
        try {
            return await event.deleteMany({
                where: {
                    id,
                    organizer: {
                        id: userId,
                    },
                },
            })
        } catch (e) {
            console.log(e)
        }
    }

    async connectUsersToEvent({ eventId, userId }) {
        return await event.update({
            where: { id: eventId },
            data: {
                members: {
                    create: [
                        {
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                        }],
                },
            },
        })
    }

    async disconnectUserFromEvent({ eventId, userId }) {
        return await event.update({
            where: { id: eventId },
            data: {
                members: {
                    deleteMany: {
                        userId,
                    },
                },
            },
        })
    }

    async broadcastMessageToEventSubscribers({ userId, eventId, messageData }) {
        const notificationService = DI.injectModule('notificationService')

        const events = await event.find({
            where: {
                organizerId: userId,
                id: eventId,
            },
            select: {
                members: {
                    select: {
                        id: true,
                    },
                },
            },
        })

        const userIds = event.members.map((el) => el.id)

        return await notificationService
            .sendPushNotifications({
                userIds,
                message: messageData,
            })
    }
}

module.exports = {
    module: {
        service: new EventService(),
        name: 'eventService',
    },
}
