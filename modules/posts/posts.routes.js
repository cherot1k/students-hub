const DI = require('../../lib/DI')
const {verify} = require('../jwt')
const {createResponse, createError} = require('../../lib/http')
const BEARER_STRING = 'Bearer '
const SOCIAL_TAG = {
    me: 'me',
    university: 'university',
    all: 'all'
}

const routes = (fastify, opts, done) => {
    const postService = DI.injectModule('postService')
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            description: 'Get posts',
            tags: ['Posts'],
            querystring: {
                type: 'object',
                properties: {
                    take: {type: 'integer'},
                    skip: {type: 'integer'},
                    order: {type: 'string', enum: ['asc', 'desc']},
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
        preHandler: async (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))

            let {take, skip, sort, order, filter, socialTag} = request.query

            socialTag ??= SOCIAL_TAG.all
            sort = sort.length > 0? sort: 'id'

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
                        select: {
                            tag: true
                        }
                    }
                },
            }

            if (socialTag === SOCIAL_TAG.me) {
                includeObject.where = {...includeObject.where, user: {id: userId}}
            }
            if (socialTag === SOCIAL_TAG.university) {
                const userService = DI.injectModule('userService')

                const user = await userService.getUserById(userId)

                const universityName = user?.profile?.group?.faculty?.university?.name

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

            //TODO refactor this and add filters again
            const query = queryBuilder.buildQuery({
                sort,
                order,
                skip: Number(skip),
                take: Number(take),
                includeObject,
                AND: []
            })
            request.data = query
            done()
        },
        handler: async (request, reply) => {
            try {
                const answer = await postService.getPosts({filterObject: request.data})
                reply.send(createResponse({data: answer}))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'GET',
        url: '/:postId',
        schema: {
            description: 'Get post',
            tags: ['Posts'],
            response: {
                200: {
                    $ref: 'post'
                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {postId} = request.params
                reply.send(createResponse(await postService.getPost({id: Number(postId)})))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'GET',
        url: '/my-posts',
        schema: {
            description: 'Get post',
            tags: ['Posts'],
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
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId} = request.body
                reply.send(createResponse(await postService.getMyPosts({userId: Number(userId)})))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/',
        schema: {
            description: 'Get posts',
            tags: ['Posts'],
            // body: {
            // $ref: 'posts'
            // },
            response: {
                200: {
                    $ref: 'post'
                }
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId} = request.body
                const data = await request.file()

                const chunkPhoto = data ? await data.toBuffer() : ''

                const {body, title, tags} = Object.values(data.fields).reduce((prev, curr) => {
                    return {...prev, [curr.fieldname]: curr.value}
                }, Object.create(null))
                const createdPost = await postService.createPost({
                    title,
                    body: [{text: body, image: ""}],
                    userId,
                    tags: JSON.parse(tags),
                    bufferImage: chunkPhoto
                })
                reply.send(createResponse({createdPost}))
            } catch (e) {
                console.log('e', e)
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'PUT',
        url: '/post',
        schema: {
            description: 'Update post',
            tags: ['Posts'],
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
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId} = request.body
                const data = await request.file()

                const chunkPhoto = data ? await data.toBuffer() : ''

                const {body, title, tags} = Object.values(data.fields).reduce((prev, curr) => {
                    return {...prev, [curr.fieldname]: curr.value}
                }, Object.create(null))
                reply.send(createResponse(await postService.updatePost({
                    id,
                    title,
                    userId,
                    chunks: [{title: body}],
                    chunkPhoto
                })))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'DELETE',
        url: '/post',
        schema: {
            description: 'Delete post',
            tags: ['Posts'],
            querystring: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer'
                    }
                },
                required: ['id']
            },
            response: {
                200: {}
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {id} = request.query
                await postService.deletePost({id})
                reply.send(createResponse({}))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'GET',
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
            try {
                reply.send(createResponse(await postService.getTags()))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/post/like',
        schema: {
            description: 'Like post',
            tags: ['Posts'],
            body: {
                type: 'object',
                properties: {
                    postId: {type: 'integer'},
                },
                required: ['postId']
            },
            response: {
                200: {}
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId, postId} = request.body
                await postService.likePost(postId, userId)
                reply.send(createResponse({}))
            } catch (e) {
                console.log(e)
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/post/unlike',
        schema: {
            description: 'Unlike post',
            tags: ['Posts'],
            body: {
                type: 'object',
                properties: {
                    postId: {type: 'integer'},
                },
                required: ['postId']
            },
            response: {
                200: {}
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId, postId} = request.body
                await postService.unlikePost(postId, userId)
                reply.send(createResponse({}))
            } catch (e) {
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/post/comment/create',
        schema: {
            description: 'Comment post',
            tags: ['Posts', 'Comments'],
            body: {
                type: 'object',
                properties: {
                    postId: {type: 'integer'},
                    text: {type: 'string'}
                },
                required: ['postId', 'text']
            },
            response: {
                200: {}
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId, postId, text} = request.body
                await postService.createComment(text, postId, userId)
                reply.send(createResponse({}))
            } catch (e) {
                console.log('error', e)
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/post/comment/like',
        schema: {
            description: 'Like comment',
            tags: ['Posts', 'Comments', 'Like'],
            body: {
                type: 'object',
                properties: {
                    commentId: {type: 'integer'},
                },
                required: ['commentId']
            },
            response: {
                200: {}
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId, commentId} = request.body
                await postService.likeComment(commentId, userId)
                reply.send(createResponse({}))
            } catch (e) {
                console.log('error', e)
                reply.send(createError(e))
            }
        }
    })

    fastify.route({
        method: 'POST',
        url: '/post/comment/unlike',
        schema: {
            description: 'Unlike comment',
            tags: ['Posts', 'Comments', 'Unlike'],
            body: {
                type: 'object',
                properties: {
                    commentId: {type: 'integer'},
                },
                required: ['commentId']
            },
            response: {
                200: {}
            }
        },
        preHandler: (request, reply, done) => {
            const userToken = request.headers.authorization.replace(BEARER_STRING, '')
            const userId = verify(userToken).id
            if (!userId) reply.code(401).send(createError('Unauthorized'))
            request.body = {...request.body, userId}
            done()
        },
        handler: async (request, reply) => {
            try {
                const {userId, commentId} = request.body
                await postService.unlikeComment(commentId, userId)
                reply.send(createResponse({}))
            } catch (e) {
                reply.send(createError(e))
            }
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
