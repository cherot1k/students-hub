'use strict'
const { createResponse, createError } = require('../../lib/http')
const DI = require('../../lib/DI')

const routes = (fastify, opts, done) => {
    const globalService = DI.injectModule('globalService')

    fastify.route({
        method: 'GET',
        url: '/init-app-data',
        schema: {
            response: {
                200: {
                    formValues: {
                        postTags: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            try {
                const data = await globalService.getInitAppData()
                reply.send(JSON.stringify({success: true, body: data}))
            } catch (e) {
                reply.send(JSON.stringify({success: false, body: new Error('Can\'t get data')}))
            }
        },
    })

    done()
}


const prefix = '/global'

module.exports = {
    data: {
        routes,
        prefix,
    },
}
