const tagsSeed = require('./tags');

async function main(){
    await tagsSeed()
}

main().catch((e) => {
    console.log(e)
    process.exit(1)
})
