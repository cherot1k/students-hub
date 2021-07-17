const Types = require('./types/types')
const Router = require('./lib/router')
const Config = require('./config')

const fastify = require('fastify')({
    logger: true
})

Types(fastify)

Router(fastify)

fastify.listen(Config.PORT, function (err){
    if(err) console.log(err)
    fastify.log.info(`server listening on ${Config.PORT}`)

})

