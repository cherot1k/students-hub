const jwt = require('../jwt')
const {user, profile} = require('../../models')
const {hash, compare} = require('../crypto')

const createUserWithProfile = async ({ticket, password, first_name, last_name, university}) => {

  const hashedPassword = await hash(password)
  const currentUser = await user.create({ticket, password: hashedPassword})
  console.log(currentUser)

  const userProfile = await profile.create({first_name, last_name, university, userId: currentUser.id })
  console.log(userProfile)
  console.log(currentUser)

  return createJWTToken({id: currentUser.id, ticket: currentUser.ticket})
}

const loginUser = async ({ticket, password}) => {
  const foundUser = await user.findOne({where: {ticket}})
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

