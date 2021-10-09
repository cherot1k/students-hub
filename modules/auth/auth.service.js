const jwt = require('../jwt')
const {hash, compare} = require('../crypto')

const {PrismaClient} = require("@prisma/client")

const {user, profile} = new PrismaClient()

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

const createJWTToken = (data) => {
  return jwt.sign(data)
}

module.exports = {
  createUserWithProfile,
  loginUser
}

