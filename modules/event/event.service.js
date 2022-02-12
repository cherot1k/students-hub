const {PrismaClient} = require("@prisma/client")
const {event} = new PrismaClient()

class EventService{
    async getEvents({filterObject}){
        try{
            let data = await event.findMany(filterObject)
            return data
        }catch(e){
            console.log('error', e)
        }
    }

    async getEvent(id){
        try{
            let data = await event.findUnique({id})
            return data
        }catch(e){
            console.log('error', e)
        }
    }

    async createEvent({name, date, organizerId, membersId, status, title, address}){
        try{
            await event.create({
                data: {
                    name,
                    date: new Date(date),
                    status,
                    title,
                    address,
                    organizer: {
                        connect:{
                            id: organizerId
                        }
                    },
                    members: {
                        create: membersId.map(el => el? ({
                            user: {
                                connect: {
                                    id: el
                                }
                            }
                        }) : ({user: null}))
                    },
                }
            })
        }catch (e) {
            console.log('error', e)
        }
    }

    async updateEvent(data, userId){
        const validObject = Object.create(null)
        Object.entries(data).forEach(([key, value]) => {
            if(value && key !== 'id') validObject[key] = value
        })


        return await event.updateMany({
            where:{
                id: data.id,
                organizerId: userId
            },
            data: validObject
        })


    }

    async deleteEvent({id}){
        try{
            return await event.delete({
                where: {
                    id
                }
            })
        }catch(e){
            console.log(e)
        }
    }

    async connectUsersToEvent({eventId, userIds}){
        return await event.update({
            where: {id: eventId},
            data: {
                members:{
                    connect: userIds.map(el => ({id: el}))
                }
            }
        })
    }

    async disconnectUserFromEvent({eventId, userIds}){
        return await event.update({
            where: {id: eventId},
            data: {
                members: {
                    disconnect: userIds.map(el => ({id: el}))
                }
            }
        })
    }
}

module.exports = {
    module: {
        service: new EventService(),
        name: 'eventService'
    }
}
