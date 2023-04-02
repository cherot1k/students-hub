const DI = require('../../lib/DI')
const {verify} = require("../jwt");

const BEARER_STRING = 'Bearer '

const preHandler = (request, reply, done) => {
  const userToken = request.headers.authorization.replace(BEARER_STRING, '')
  const userId = verify(userToken)?.id
  if (!userId) reply.code(401).end()

  request.body = { ...request.body, userId }

  done()
}

const routes = (fastify, opts, done) => {
  const userService = DI.injectModule('userService')

  fastify.addHook('preHandler', preHandler)

  fastify.route({
    method: 'GET',
    url: '/me',
    schema: {
      description: 'Get me',
      tags: ['Users'],

    },
    handler: async(request, reply) => {
      const {userId} = request.body
      const answer = await userService.getMe({userId})

      return reply.send( JSON.stringify({success: true, body: answer}))
    }

  })

  done()
}

const prefix = '/user'

module.exports = {
  data: {
    routes,
    prefix,
  },
}