'use strict'
module.exports = (fastify, opts, done) => {
    fastify.addSchema({
        $id: 'chatCreate',
        type: 'object',
        properties: {
            name: {type: 'string'},
            date: {type: 'string'},
            membersId: {type: 'array', items: {type: 'integer'}},
            status: {type: 'string'},
            title: {type: 'string'},
            address: {type: 'string'},
            organizerId: {type: 'string'}
        }
    })

    fastify.addSchema({
        $id: 'addToChat',
        type: 'object',
        properties: {
            name: {type: 'string'},
            date: {type: 'string'},
            membersId: {type: 'array', items: {type: 'integer'}},
            status: {type: 'string'},
            title: {type: 'string'},
            address: {type: 'string'},
            organizerId: {type: 'string'}
        }
    })

    fastify.addSchema({
        $id: 'chatUpdate',
        type: 'object',
        properties: {
            name: {type: 'string'},
            date: {type: 'string'},
            membersId: {type: 'array', items: {type: 'integer'}},
            status: {type: 'string'},
            title: {type: 'string'},
            address: {type: 'string'},
            organizerId: {type: 'string'}
        }
    })

}
