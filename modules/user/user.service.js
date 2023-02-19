'use strict'
const {formatUsers, formatFullUser} = require("./user.utils");
const {formatUser} = require("./user.utils");
const { PrismaClient } = require('@prisma/client')
const { user } = new PrismaClient()

class UserService {
    async getUserById(id) {
        try {
            const data = await user.findUnique({
                where: {
                    id,
                },
                include: {
                    profile: {
                        include: {
                            group: {
                                include: {
                                    faculty: {
                                        include: {
                                            university: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            return data
        } catch (e) {
            console.log('error', e)
        }
    }

    async getUsers({take, skip, sort, order, filter}){

        const filterEntries = Object.entries(filter)

        const users = await user.findMany({
            take,
            skip,
            orderBy: {
                [sort || 'first_name'] : order
            },
            where: {
                profile: {

                    OR: filterEntries.map( ([key, value]) => ({
                        [key]: {
                            startsWith: value
                        }
                    }))
                }
            },
            select: {
                id: true,
                ticket: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        first_name: true,
                        last_name: true,
                        imageUrl: true,
                        updatedAt: true,
                        createdAt: true,
                    }

                }
            }
        })
        return formatUsers(users)
    }


    async getMe({userId}){
        const found = await user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                ticket: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        first_name: true,
                        last_name: true,
                        imageUrl: true,
                        updatedAt: true,
                        createdAt: true,
                        email: true,
                        group: {
                            select: {
                                id: true,
                                name: true,
                                faculty: {
                                    select: {
                                        id: true,
                                        name: true,
                                        university: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        })

        return formatFullUser(found)
    }


}

module.exports = {
    module: {
        service: new UserService(),
        name: 'userService',
    },
}
