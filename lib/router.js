const Auth = require('../modules/auth/')

const routes = {
    auth: {
        routes: Auth.routes,
        prefix: '/auth'
    }
}

module.exports = async (fastify) => {
    for (let route of Object.values(routes)){
       await fastify.register(route.routes, {prefix: route.prefix})
    }
}