const {PrismaClient} = require('@prisma/client')
const {tag, $disconnect} = new PrismaClient()

const tags = [
    {id: 1, value: "BLM"},
    {id: 2, value: "WLM"},
    {id: 3, value: "Nudes"},
    {id: 4, value: "Cum"},
    {id: 5, value: "Noggers"},
]

module.exports = async () => {
    for (const currentTag of tags){
        await tag.upsert({
            where: {
                id: currentTag.id
            },
            create: {value: currentTag.value},
            update: {value: currentTag.value},
        })
    }
    await $disconnect()
}
