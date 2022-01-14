const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const tagsSeed = require('./tags');

async function main(){
    await tagsSeed()
}

main().catch((e) => {
    console.log(e)
    process.exit(1)
}).finally(async() => await prisma.$disconnect())
