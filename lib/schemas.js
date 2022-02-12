const Auth = require('../modules/auth')
const Posts = require('../modules/posts/post.schemas')
const Events = require('../modules/event/event.schemas')

const schemas = {
  auth: Auth.schemas,
  posts: Posts,
  events: Events
}

module.exports = (fastify) => {
  for (const schema of Object.values(schemas)){
    schema(fastify)
  }
}
