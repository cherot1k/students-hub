const Auth = require('../modules/auth')

const schemas = {
  auth: Auth.schemas
}

module.exports = async (fastify) => {
  for (const schema of Object.values(schemas)){
    await schema(fastify)
  }
}