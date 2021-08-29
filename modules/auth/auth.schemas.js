module.exports = async (fastify, opts, done) => {
  fastify.addSchema({
    $id: 'login',
    type: 'object',
    properties: {
      ticket: {type: 'string'},
      password: {type: 'string'}
    }
  })

  fastify.addSchema({
    $id: 'registration',
    type: 'object',
    properties: {
      ticket: {type: 'string'},
      password: {type: 'string'},
      first_name: {type: 'string'},
      last_name: {type: 'string'},
      university: {type: 'string'}
    },
    required: ['ticket', 'password', 'first_name', 'last_name', 'university']
  })
}