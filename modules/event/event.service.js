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

    async getEvent({id, userId}){
        try{
            let data = await event.findMany({
                where:{
                    id: Number(id),
                    organizer:{
                        id: Number( userId)
                    }
                }
            })
            return data?.[0]
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

    async deleteEvent({id, userId}){
        try{
            return await event.deleteMany({
                where: {
                    id,
                    organizer: {
                        id: userId
                    }
                }
            })
        }catch(e){
            console.log(e)
        }
    }

    async connectUsersToEvent({eventId, userId}){
        return await event.update({
            where: {id: eventId},
            data: {
                members:{
                    connect: {
                        id: userId
                    }
                }
            }
        })
    }

    async disconnectUserFromEvent({eventId, userId}){
        return await event.update({
            where: {id: eventId},
            data: {
                members: {
                    disconnect: {
                        id: userId
                    }
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
