const {PrismaClient} = require('@prisma/client')
const {user} = new PrismaClient()

class UserService {
    async getUserById(id) {
        try {
            let data = await user.findUnique({
                where: {
                    id
                },
                include: {
                    profile: {
                        include: {
                            group: {
                                include: {
                                    faculty: {
                                        include: {
                                            university: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
            return data
        } catch (e) {
            console.log('error', e)
        }
    }

}

module.exports = {
    module: {
        service: new UserService(),
        name: 'userService'
    }
}
