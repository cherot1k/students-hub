const {PrismaClient} = require('@prisma/client')
const {tag, $disconnect} = new PrismaClient()

const tags = [
    {id: 1, value: "Sport"},
    {id: 2, value: "Alchemical"},
    {id: 3, value: "Organic"},
    {id: 4, value: "Ride"},
    {id: 5, value: "Garden"},
    {id: 6, value: "Math"},
    {id: 7, value: "Celebrities"},
    {id: 8, value: "Fights"}
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
}
