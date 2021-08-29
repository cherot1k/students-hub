const jwt = require('jsonwebtoken')

const defaultOptions = {
  expiresIn: 1000*60*60*24*30*3
}

const sign = (data, options = defaultOptions) => {
  return jwt.sign(data, process.env.SECRET_KEY , options)
}

const verify = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY)
}

module.exports = {
  sign,
  verify
}