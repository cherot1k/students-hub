const DI = require("../../lib/DI");
const {verify} = require("../jwt");
const {createResponse, createError} = require("../../lib/http");
const BEARER_STRING = 'Bearer ';

const routes = (fastify, opts, done) => {
    // const chatService = DI.injectModule("chatService")
    fastify.route({
        method: "GET",
        url: '/',
        schema: {
            description: "chat",
            tags: ['Chat'],
            summary: '',
            // body:{
            //     $ref: 'postEvent'
            // },
            // response:{
            //     200: {
            //         event: {
            //             $ref: 'event'
            //         }
            //     }
            // }
        },
        // preHandler: (request, reply, done) => {
        //     const userToken = request.headers.authorization.replace(BEARER_STRING, '')
        //     const userId = verify(userToken)?.id
        //     if(!userId) reply.code(401).send(createError("Unauthorized"))
        //     request.body = {...request.body, userId}
        //     done()
        // },
        handler: async (request, reply) => reply.send("sup"),
        wsHandler: (connection, request) => {
            connection.socket.on('message', message => {
                // message.toString() === 'hi from client'
                connection.socket.send('hi from server')
            })
        }
    })

    done()
}

const prefix = '/chat'

module.exports = {
    data: {
        routes,
        prefix
    }
}
