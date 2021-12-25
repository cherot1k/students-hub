module.exports = (fastify, opts, done) => {
    fastify.addSchema({
        $id: 'post',
        type: 'object',
        properties: {
            header: {type: 'string'},
            body: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        index: {type: 'number'},
                        content: {type: 'string'}
                    }
                }
            },
            authorId: {type: 'number'}
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
        $id: 'getPosts',
        type: 'object',
        properties: {
            rows: {type: 'number'},
            page: {type: 'number'},
            order: {type: 'string', enum: ["ASC", "DESC"]},
            sort: {type: 'string'},
            filter: {
                type: 'object',
                properties: {
                    authorId: {type: 'number'},
                    header: { type: 'string' },
                    body: {type: 'string'}
                }
            }

        }
    })
}
