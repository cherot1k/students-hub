const DI = require('../../lib/DI')
const {verify} = require("../jwt");
const BEARER_STRING = 'Bearer '

const routes = (fastify, opts, done) => {
    fastify.route({
        method: "GET",
        url: '/',
        schema:{
            description: "Get posts",
            tags: ["Posts"],
            querystring: {
                type: 'object',
                properties: {
                    take: {type: 'integer'},
                    skip: {type: 'integer'},
                    order: {type: 'string', enum: ["asc", "desc"]},
                    sort: {type: 'string'},
                    tags: {
                        type: 'array',
                        items: {
                            type: 'integer'
                        }
                    }
                    // filter: {
                    //     type: 'object',
                    //     properties: {
                    //         authorId: {type: 'number'},
                    //         header: { type: 'string' },
                    //     },
                    // }
                },
                required: ['take', 'skip', 'order', 'sort']
            },
            response: {
                200: {
                    $ref: 'posts'
                }
            }
        },
        preHandler : (request, reply, done) => {
            const {take, skip, sort, order, filter} = request.query
            const queryBuilder = DI.injectModule('query-builder')
            const includeObject = {
                include: {
                    chunks: {
                        select: {
                            id: true,
                            image: true,
                            text: true,
                            createdAt: true,
                        }
                    },
                    tags: {
                        select:{
                            tag: true
                        }
                    }
                },
            }

            const query = queryBuilder.buildQuery({sort, order, skip: Number(skip), take: Number(take), includeObject, AND: filter? JSON.parse(filter) : {}})
            request.data = query
            done()
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const answer = await postService.getPost({ filterObject: request.data})
            reply.send({data: answer})
        }
    })

    fastify.route({
        method: "GET",
        url: '/:postId',
        schema:{
            description: "Get post",
            tags: ["Posts"],
            body: {
                $ref: 'getPosts'
            },
            response: {
                200: {
                    $ref: 'post'
                }
            }
        },
        handler: (request, reply) => {

        }
    })

    fastify.route({
        method: "POST",
        url: '/',
        schema: {
            description: "Get posts",
            tags: ["Posts"],
            body: {
                $ref: 'post'
            },
            response: {
                200: {
                    $ref: 'post'
                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {body, title, userId, tags} = request.body
            const createdPost = await postService.createPost({title, body, userId, tags})
            reply.send({createdPost})
        }
    })

    fastify.route({
        method: "PUT",
        url: "/post",
        schema: {
            description: "Update post",
            tags: ["Posts"],
            body: {
                $ref: 'updatePost'
            },
            // response: {
            //     200: {
            //      $ref: 'post'
            //     }
            // }
        },

        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {title, id} = request.body
            reply.send(await postService.updatePost({id, title}))
        }
    })

    fastify.route({
        method: "PUT",
        url: "/chunks",
        schema: {
            description: "Update post",
            tags: ["Posts"],
            body: {
                $ref: 'updateChunks'
            },
            // response: {
            //     200: {
            //         $ref: 'post'
            //     }
            // }
        },

        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {chunks}  = request.body
            reply.send(await postService.updateChunks(chunks))
        }
    })

    fastify.route({
        method: "DELETE",
        url: '/chunk',
        schema: {
            description: "Delete post",
            tags: ["Posts"],
            querystring: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number'
                    }
                },
                required: ['id']
            },
            response:{
                200: {

                }
            }
        },
        handler: async (request, reply) => {
            const {id} = request.query
            const postService = DI.injectModule('postService')

            await postService.deleteChunk({id})
            reply.end()
        }
    })

    fastify.route({
        method: "DELETE",
        url: '/post',
        schema: {
            description: "Delete post",
            tags: ["Posts"],
            querystring: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number'
                    }
                },
                required: ['id']
            },
            response:{
                200: {

                }
            }
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {id} = request.query
            await postService.deletePost({id})
            reply.end()
        }
    })
    done()
}

const prefix = '/posts'

module.exports = {
    data: {
        routes,
        prefix
    }
}
