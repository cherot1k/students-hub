const crypto = require('crypto')

const hash = async (password) => {
    return (await crypto.scryptSync(password, process.env.SECRET_KEY, 64)).toString('hex')
}

const compare = async (password, hashedPassword) => {
    return await hash(password) === hashedPassword
}

module.exports = {
    hash,
    compare
}
