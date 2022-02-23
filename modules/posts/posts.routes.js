const DI = require('../../lib/DI')
const {verify} = require("../jwt");
const {createResponse, createError} = require("../../lib/http");
const BEARER_STRING = 'Bearer '
const SOCIAL_TAG = {
    me: 'me',
    university: 'university',
    all: 'all'
}

const routes = (fastify, opts, done) => {
    const postService = DI.injectModule('postService')
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
                    },
                    socialTag: {type: 'string', enum: Object.values(SOCIAL_TAG)}
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
        preHandler : async (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if(!userId) reply.code(401).send(createError("Unauthorized"))

            const {take, skip, sort, order, filter, socialTag} = request.query

            const queryBuilder = DI.injectModule('query-builder')
            const includeObject = {
                where: {},
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

            if(socialTag === SOCIAL_TAG.me){
                includeObject.where = {...includeObject.where, user: {id: userId}}
            }
            if(socialTag === SOCIAL_TAG.university){
                const userService = DI.injectModule('userService')

                const user = await userService.getUserById(userId)

                const universityName = user?.profile?.group?.faculty?.university?.name;

                includeObject.where = {
                    ...includeObject.where,
                    user: {
                        profile: {
                            group: {
                                faculty: {
                                    university: {
                                        name: universityName
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const query = queryBuilder.buildQuery({sort, order, skip: Number(skip), take: Number(take), includeObject, AND: filter? JSON.parse(filter) : {}})
            request.data = query
            done()
        },
        handler: async (request, reply) => {
            const answer = await postService.getPosts({ filterObject: request.data})
            reply.send(createResponse({data: answer}))
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
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if(!userId) reply.code(401).send(createError("Unauthorized"))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const id = request.params.id
            const {userId} = request.body
            reply.send(createResponse(await postService.getPost({id, userId})))

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
            if(!userId) reply.code(401).send(createError("Unauthorized"))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {body, title, userId, tags} = request.body
            const createdPost = await postService.createPost({title, body, userId, tags})
            reply.send(createResponse( {createdPost}))
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
            response: {
                200: {
                 $ref: 'post'
                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if(!userId) reply.code(401).send(createError("Unauthorized"))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {title, id, userId} = request.body
            reply.send(createResponse( await postService.updatePost({id, title, userId})))
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
            response: {
                200: {
                    type: 'array',
                    items: {
                        $ref: 'chunk'
                    }
                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if(!userId) reply.code(401).send(createError("Unauthorized"))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {chunks, userId}  = request.body
            reply.send(createResponse( await postService.updateChunks(chunks, userId)))
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
                        type: 'integer'
                    }
                },
                required: ['id']
            },
            response:{
                200: {

                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if(!userId) reply.code(401).send(createError("Unauthorized"))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const {id} = request.query
            const postService = DI.injectModule('postService')

            await postService.deleteChunk({id})
            reply.send(createResponse({}))
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
                        type: 'integer'
                    }
                },
                required: ['id']
            },
            response:{
                200: {

                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if(!userId) reply.code(401).send(createError("Unauthorized"))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            const postService = DI.injectModule('postService')
            const {id} = request.query
            await postService.deletePost({id})
            reply.send(createResponse({}))
        }
    })

    fastify.route({
        method: "GET",
        url: '/tags',
        schema: {
          200: {
            type: 'array',
              items: {
                type: 'object',
                  properties: {
                    id: 'number',
                    value: 'string'
                  }
              }
          }
        },
        handler: async (request, reply) => {
            reply.send(createResponse( await postService.getTags()))
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
