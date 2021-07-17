const User = require('../routes/user')
const Auth = require('../routes/auth')

const routes = {
    user: {
        routes: User,
        prefix: '/user'
    },
    auth: {
        routes: Auth,
        prefix: '/auth'
    }
}

module.exports = async (fastify) => {
    for (let route of Object.values(routes)){
       await fastify.register(route.routes, {prefix: route.prefix})
    }
}