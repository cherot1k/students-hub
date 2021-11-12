const jwt = require('../jwt')
const {hash, compare} = require('../crypto')
const {asClass, Lifetime} = require('awilix')
const {diContainer} = require('fastify-awilix')

const {PrismaClient} = require("@prisma/client")

const {user, profile} = new PrismaClient()


class AuthService{
   async createUserWithProfile({ticket, password, first_name, last_name, university}){
     const hashedPassword = await hash(password)

     const currentProfile = await profile.create({
       data:{
         first_name, last_name, university, group: "2", email: "dder255t@gmail.com"
       }
     })

     const currentUser = await user.create({
       data:{
         ticket,
         password: hashedPassword,
         profileId: currentProfile.id
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

const createUserWithProfile = async ({ticket, password, first_name, last_name, university}) => {

  const hashedPassword = await hash(password)

  const currentProfile = await profile.create({
    data:{
      first_name, last_name, university, group: "2", email: "dder255t@gmail.com"
    }
  })

  const currentUser = await user.create({
    data:{
      ticket,
      password: hashedPassword,
      profileId: currentProfile.id
    }
  })
  console.log(currentUser)

  return createJWTToken({id: currentUser.id, ticket: currentUser.ticket})
}

const loginUser = async ({ticket, password}) => {
  const foundUser = await user.findUnique({where: {ticket}})
  if(!foundUser) throw new Error('no user')
  if(!await compare(password,  foundUser.password)) throw new Error('passwords are not equal')
  return createJWTToken({id: foundUser.id, ticket: foundUser.ticket})
}

const verify = async (token) => {
  return jwt.verify(token)
}

const createJWTToken = (data) => {
  return jwt.sign(data)
}

const registerService = () => {
  diContainer.register({
    authService: asClass(AuthService, {lifetime: Lifetime.SINGLETON})
  })
}

module.exports = {
  createUserWithProfile,
  loginUser,
  verify,
  registerService
}

