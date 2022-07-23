const DI = require('../../lib/DI')
const {verify} = require('../jwt')
const {createResponse, createError} = require('../../lib/http')
const BEARER_STRING = 'Bearer '

const SOCIAL_TAG = {
    me: 'Mine',
    university: 'My university',
    all: 'All'
}

const preHandler = async (request, reply) => {
    const userToken = request.headers.authorization.replace(BEARER_STRING, '')
    const userId = verify(userToken).id
    if (!userId) reply.code(401).send(createError('Unauthorized'))

    request.body = {...request.body, userId}

    return reply
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
        preHandler,
        handler: async (request, reply) => {
            const {take, skip, filter, socialTag} = request.query
            const {userId} = request.body

            const data = {
                take: Number(take),
                skip: Number(skip),
                sort : 'id',
                order: 'desc',
                filter,
                socialTag,
                userId
            }

            try {
                const answer = await postService.getPosts(data)
                reply.send(createResponse(answer))
            } catch (e) {
                console.log(e)
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
        preHandler,
        handler: async (request, reply) => {
            try {
                const {userId} = request.body
                const {postId} = request.params
                const post = await postService.getPost({id: Number(postId), userId: Number(userId)})
                reply.send(createResponse(post))
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
        preHandler,
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
        preHandler,
        handler: async (request, reply) => {
            try {
                const data = await request.file()

                const chunkPhoto = data ? await data?.toBuffer() : ''

                const {body, title, tags, userId} = request.body
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
        preHandler,
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
        preHandler,
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
        preHandler,
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
        preHandler,
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
        method: 'GET',
        url: '/post/comments/:postId',
        schema: {

        },
        handler: async (request, reply, done) => {
            const {postId} = request.params
            const res = await postService.getPostComments(postId)
            reply.send(createResponse(res))
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
        preHandler,
        handler: async (request, reply) => {
            try {
                const {postId, text, userId} = request.body
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
        preHandler,
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
        preHandler,
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

    fastify.route({
        method: 'POST',
        url: '/post/toggle-like',
        schema: {
            body:{
                type: 'object',
                properties: {
                    isLiked: {type: 'boolean',},
                    postId: {type: 'integer'}
                }
            }
        },
        preHandler,
        handler: async (request, reply, done) => {
            const {isLiked, postId, userId} = request.body

            if(isLiked){
                await postService.likePost(postId, userId)
            }else {
                await postService.unlikePost(postId, userId)
            }

            return reply.send( createResponse(isLiked))
        }
    })

    fastify.route({
        method: 'POST',
        url: '/post/comment/toggle-like',
        schema: {
            body:{
                type: 'object',
                properties: {
                    isLiked: {type: 'boolean',},
                    commentId: {type: 'integer'}
                }
            }
        },
        preHandler,
        handler: async (request, reply, done) => {
            const {isLiked, postId, userId} = request.body

            if(isLiked){
                await postService.likeComment(postId, userId)
            }else {
                await postService.unlikeComment(postId, userId)
            }

            return reply.send( createResponse(isLiked))
        }
    })

    fastify.route({
        method: 'POST',
        url: '/upsert',
        schema: {
            description: 'Upsert post',
            tags: ['Posts'],
            response: {
                200: {}
            }
        },
        preHandler,
        handler: async (request, reply) => {
            try {

                const data = await request.file()

                const buffer = await data?.toBuffer() || ''
                const chunkPhoto = buffer?.length > 0? buffer : null

                const obj = request.body

                const {body, title, tags, userId} = obj

                const id = obj?.id || null

                const res = await postService.createOrUpdatePost({
                    title,
                    body,
                    userId,
                    tags: JSON.parse(tags),
                    imageData: chunkPhoto,
                    id,
                })

                reply.send(createResponse(res))
            } catch (e) {
                console.log('e', e)
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
