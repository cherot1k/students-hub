module.exports = (fastify, opts, done) => {
    fastify.addSchema({
        $id: 'chunk',
        type: 'object',
        properties: {
            id: {type: 'integer'},
            image: {type: 'string'},
            text: {type: 'string'},
            createdAt: {type: 'string'},
        }
    })

    fastify.addSchema({
        $id: 'post',
        type: 'object',
        properties: {
            id: {type: 'integer'},
            title: {type: 'string'},
            chunks: {
                type: 'array',
                items: {
                    $ref: 'chunk'
                }
            },
            createdAt: {type: 'string'},
            tags: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        }
    })

    fastify.addSchema({
        $id: 'posts',
        type: 'array',
        items: {
            $ref: 'post'
        }
    })

    fastify.addSchema({
        $id: 'updatePost',
        type: 'object',
        properties: {
            id: {
                type: 'integer'
            },
            title: {
                type: 'string'
            }
        },
        required: ['id','title']
    })

    fastify.addSchema({
        $id: 'updateChunks',
        type: 'object',
        properties: {
            chunks: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer'
                        },
                        image: {
                            type: 'string'
                        },
                        text: {
                            type: 'string'
                        }
                    },
                    required: ['id']
                }
            }
        },
        required: ['chunks']
    })

    fastify.addSchema({
        $id: 'getPosts',
        querystring: {
            type: 'object',
            properties: {
                take: {type: 'integer'},
                skip: {type: 'integer'},
                order: {type: 'string', enum: ["ASC", "DESC"]},
                sort: {type: 'string'},
                filter: {
                    type: 'object',
                    properties: {
                        authorId: {type: 'number'},
                        header: { type: 'string' },
                    },
                }
            },
            required: ['take, skip, order', 'sort']
        }
    })

    fastify.addSchema({
        $id: 'delPost',
        type: 'object',
        properties: {
            id: {type: 'number'}
        }
    })
}
