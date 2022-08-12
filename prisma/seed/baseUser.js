const {PrismaClient} = require('@prisma/client')
const prismaClient = new PrismaClient()

const {user, profile, group, university, faculty} = prismaClient;

const DEFAULT_UNIVERSITY_DATA = {
    name: 'VNTU',
}

const DEFAULT_FACULTY = {
    name: 'FITKI'
}

const DEFAULT_GROUP = {
    name: 'FITKI'
}

const DEFAULT_PROFILE = {
    first_name: 'GIGACHAD',
    last_name: 'GIGACHADENKO',
    email: 'dder255t@gmail.com',
    imageUrl: 'google.com',
}

const DEFAULT_USER = {
    ticket: '1111',
    password: '09196a79c7809e3fb23a785f53ae2bff9e94ca7b07fc794594cb67f5b23e9f711bf4d06247bbcc5270b5dacae2087e965061aadb82868a50c153e59b570b939e'
}

module.exports = async () => {
    await user.upsert({
        where: {
            ticket: DEFAULT_USER.ticket
        },
        create: {
            ...DEFAULT_USER,
            profile: {
                create: {
                    ...DEFAULT_PROFILE,
                    group: {
                        connectOrCreate: {
                            where: {
                                name: DEFAULT_GROUP.name
                            },
                            create: {
                                ...DEFAULT_GROUP,
                                faculty: {
                                    connectOrCreate: {
                                        where: {
                                            name: DEFAULT_FACULTY.name,
                                        },
                                        create: {
                                            ...DEFAULT_FACULTY,
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
                                }
                            }
                        }
                    }
                }
            }
        },
        update: {}
    })
}
