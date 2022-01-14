const jwt = require('../jwt')
const {hash, compare} = require('../crypto')

const {PrismaClient} = require("@prisma/client")

const {user, profile} = new PrismaClient()


class AuthService{
   async createUserWithProfile({ticket, password, first_name, last_name, university, group, email}){
     const hashedPassword = await hash(password)

     const currentUser = await user.create({
       data:{
         ticket,
         password: hashedPassword,
         profile: {
             create: {
                 first_name, last_name, university, group, email
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

