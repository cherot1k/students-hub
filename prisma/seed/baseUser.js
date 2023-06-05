const {PrismaClient} = require('@prisma/client')
const prismaClient = new PrismaClient()

const { user } = prismaClient;

const DEFAULT_UNIVERSITY_DATA = {
    name: 'VNTU',
}

const DEFAULT_FACULTY = {
    name: 'FITKI'
}

const DEFAULT_GROUP = {
    name: 'FITKI'
}

const USERS = [
    {
        ticket: '1111',
        password: '09196a79c7809e3fb23a785f53ae2bff9e94ca7b07fc794594cb67f5b23e9f711bf4d06247bbcc5270b5dacae2087e965061aadb82868a50c153e59b570b939e',
        profile: {
            first_name: 'GIGACHAD',
            last_name: 'GIGACHADENKO',
            email: 'dder255t@gmail.com',
            imageUrl: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=1200:*',
        }
    },
    {
        ticket: '2222',
        password: '6ce7c11658479b96f3f42be362949145cce3f038da4d3cd82100441281a51d6521ce1d9c594d0ecb80b239573f62c361e409b3e82cb1be5d6b5e349f4735d069',
        profile: {
            first_name: 'KOLOBOK',
            last_name: 'DID',
            email: 'lulok2t@gmail.com',
            imageUrl: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=1200:*',
        }
    }
]

module.exports = async () => {
    for (let seedUser of USERS){
        await user.upsert({
            where: {
                ticket: seedUser.ticket
            },
            create: {
                ticket: seedUser.ticket,
                password: seedUser.password,
                profile: {
                    create: {
                        ...seedUser.profile,
                        group: {
                            connectOrCreate: {
                                where: {
                                    name: DEFAULT_GROUP.name
                                },
                                create: {
                                    ...DEFAULT_GROUP,
                                }
                            }
                        },
                        faculty: {
                            connectOrCreate: {
                                where: {
                                    name: DEFAULT_FACULTY.name,
                                },
                                create: {
                                    ...DEFAULT_FACULTY,
                                }
                            }
                        },
                        university: {
                            connectOrCreate: {
                                where: {
                                    name: DEFAULT_UNIVERSITY_DATA.name,
                                },
                                create: {
                                    ...DEFAULT_UNIVERSITY_DATA
                                }
                            }
                        }
                    }
                }
            },
            update: {}
        })
    }

}
