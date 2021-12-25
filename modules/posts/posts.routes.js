const routes = (fastify, opts, done) => {
    fastify.route({
        method: "GET",
        url: '/',
        schema:{
            description: "Get posts",
            tags: ["Posts"],
            body: {
                $ref: 'getPosts'
            },
            response: {
                200: {
                    $ref: 'posts'
                }
            }
        },
        handler: (request, reply) => {

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
        handler: (request, reply) => {

        }
    })

    fastify.route({
        method: "PUT",
        url: "/",
        schema: {
            description: "Update post",
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
        method: "DELETE",
        url: '/',
        schema: {
            description: "Delete post",
            tags: ["Posts"],
            body: {
                $ref: "getPosts"
            },
            response:{
                200: {

                }
            }
        },
        handler: (request, reply) => {

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
