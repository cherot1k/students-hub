'use strict'
const jwt = require('../jwt')
const { hash, compare } = require('../crypto')
const DI = require('../../lib/DI')
const { PrismaClient } = require('@prisma/client')
const { AuthorizationError } = require('./auth.errors')

const { user } = new PrismaClient()

const createJWTToken = (data) => jwt.sign(data)

class AuthService {
    async createUserWithProfile({ ticketPhoto, password, email, group }) {
        const hashedPassword = await hash(password)
        const imageRecognitionService = DI.injectModule('imageRecognition')
        const imageStorage = DI.injectModule('imageStorage')
        const user_data = await imageRecognitionService.recognizeTicketData(ticketPhoto)
        const { ticket, full_name, faculty, university, userImage } = user_data
        const [first_name, _, last_name] = full_name.trim().split(' ')
        const userImageUrl = await imageStorage.storeImageAndReturnUrl(userImage)
        const currentUser = await user.create({
            data: {
                ticket,
                password: hashedPassword,
                profile: {
                    create: {
                        first_name,
                        last_name,
                        group: {
                            connectOrCreate: {
                                where: {
                                    name: group.trim(),
                                },
                                create: {
                                    name: group.trim(),
                                },
                            },
                        },
                        faculty: {
                            connectOrCreate: {
                                where: {
                                    name: faculty.trim(),
                                },
                                create: {
                                    name: faculty.trim(),
                                },
                            },
                        },
                        university: {
                            connectOrCreate: {
                                where: {
                                    name: university.trim(),
                                },
                                create: {
                                    name: university.trim(),
                                },
                            },
                        },
                        email,
                        imageUrl: userImageUrl,
                    },
                },
            },
        })

        return createJWTToken({ id: currentUser.id, ticket: currentUser.ticket, role: currentUser.role })
    }
    async loginUser({ ticket, password })  {
        const foundUser = await user.findUnique({ where: { ticket } })
        if (!foundUser) throw new AuthorizationError('No user found')
        if (!await compare(password,  foundUser.password)) throw new AuthorizationError('Ticket or password are wrong')
        return createJWTToken({ id: foundUser.id, ticket: foundUser.ticket, role: foundUser.role })
    }

    async loginAdmin({ticket, password}){
        const foundUser = await user.findUnique({where: {ticket}})
        if (!foundUser) throw new AuthorizationError('No user found')
        if (!await compare(password,  foundUser.password)) throw new AuthorizationError('Ticket or password are wrong')
        if(foundUser.role !== 'ADMIN') new AuthorizationError('Your role is not admin, try to login non admin login or contact support')
        return createJWTToken({ id: foundUser.id, ticket: foundUser.ticket, role: foundUser.role })
    }

    verify(token) {
        return jwt.verify(token)
    }

    async createTeacher({ticket, password, email, universityName, first_name, last_name, image, }){
        const imageStorage = DI.injectModule('imageStorage')
        const userImageUrl = await imageStorage.storeImageAndReturnUrl(image)
        const hashedPassword = await hash(password)

        const currentUser = await user.create({
            data: {
                ticket,
                password: hashedPassword,
                profile: {
                    create: {
                        first_name,
                        last_name,
                        university: {
                            connectOrCreate: {
                                where: {
                                    name: universityName.trim(),
                                },
                                create: {
                                    name: universityName.trim(),
                                },
                            },
                        },
                        email,
                        imageUrl: userImageUrl,
                    },
                },
                role: 'TEACHER'
            },
        })

        return createJWTToken({ id: currentUser.id, ticket: currentUser.ticket, role: currentUser.role })
    }
}

module.exports = {
    module: {
        service: new AuthService(),
        name: 'authService',
    },
}

