'use strict'
const crypto = require('crypto')

const hash = async (password) => (await crypto.scryptSync(password, process.env.SECRET_KEY, 64)).toString('hex')

const compare =
    async (password, hashedPassword) => await hash(password) === hashedPassword

console.log(crypto.scryptSync('2222', 'potato1', 64).toString('hex'))

module.exports = {
    hash,
    compare,
}
