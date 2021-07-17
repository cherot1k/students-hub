const User = require('../routes/user')

const routes = {
    user: User
}

module.exports = async (fastify) => {
    for await (let route of Object.values(routes)){
       await fastify.register(User, {prefix: '/user'})
    }
}