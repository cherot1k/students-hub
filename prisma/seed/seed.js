const tagsSeed = require('./tags');
const baseUserSeed = require('./baseUser')

async function main(){
    await tagsSeed()
    await baseUserSeed()
}

main().catch((e) => {
    console.log(e)
    process.exit(1)
})
