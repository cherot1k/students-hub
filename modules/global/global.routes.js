const {createResponse, createError} = require('../../lib/http')
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
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                reply.send(createResponse(await globalService.getInitAppData()))
            } catch (e) {
                reply.send(createError('Can\'t get data'))
            }
        }
    })

    done()
}


const prefix = '/global'

module.exports = {
    data: {
        routes,
        prefix
    }
}
