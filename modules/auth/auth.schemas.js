module.exports =  (fastify, opts, done) => {
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
      ticketPhoto: {type: 'string'},
      password: {type: 'string'},
      email: {type: 'string'},
      group: {type: 'string'},
    },
    required: ['ticketPhoto', 'password', 'email', 'group']
  })
}
