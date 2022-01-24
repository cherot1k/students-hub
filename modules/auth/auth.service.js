const jwt = require('../jwt')
const {hash, compare} = require('../crypto')
const DI = require('../../lib/DI')
const {PrismaClient} = require("@prisma/client")

const {user} = new PrismaClient()

class AuthService{
   async createUserWithProfile({ticketPhoto, password, email, group}){
     const hashedPassword = await hash(password)
     const imageRecognitionService = DI.injectModule('imageRecognition')
     const imageStorage = DI.injectModule('imageStorage')
     const user_data = await imageRecognitionService.recognizeTicketData(ticketPhoto)
     const {ticket, full_name, faculty, university, userImage} = user_data
     const [first_name, _, last_name] = full_name.trim().split(' ')
     const userImageUrl = await imageStorage.storeImageAndReturnUrl(userImage)
     const currentUser = await user.create({
       data:{
         ticket,
         password: hashedPassword,
         profile: {
             create: {
                 first_name,
                 last_name,
                 group: {
                     connectOrCreate:{
                         where: {
                             name: group.trim()
                         },
                         create: {
                             name: group.trim(),
                             faculty: {
                                 connectOrCreate: {
                                     where: {
                                         name: faculty.trim()
                                     },
                                     create: {
                                         name: faculty.trim(),
                                         university: {
                                             connectOrCreate: {
                                                 where: {
                                                     name: university.trim()
                                                 },
                                                 create: {
                                                     name: university.trim()
                                                 }
                                             }
                                         }
                                     }
                                 }
                             }
                         }
                     }
                 },
                 email,
                 imageUrl: userImageUrl
             }
         }
       }
     })

     return createJWTToken({id: currentUser.id, ticket: currentUser.ticket})
   }
   async loginUser({ticket, password})  {
    const foundUser = await user.findUnique({where: {ticket}})
    if(!foundUser) throw new Error('no user')
    if(!await compare(password,  foundUser.password)) throw new Error('passwords are not equal')
    return createJWTToken({id: foundUser.id, ticket: foundUser.ticket})
  }
}

const createJWTToken = (data) => {
  return jwt.sign(data)
}


module.exports = {
  module: {
    service: new AuthService(),
    name: 'authService'
  }
}

