const tagsSeed = require('./tags');
const baseUserSeed = require('./baseUser')
const postSeed = require('./post')
const chatSeed = require('./chat')

async function main(){
    await tagsSeed()
    await baseUserSeed()
    await postSeed()
    await chatSeed()
}

main().catch((e) => {
    console.log(e)
    process.exit(1)
})
