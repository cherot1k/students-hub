'use strict'
// const PrismaErrorsMap = {
//     'P2002': 'Unique db relations failed (some related thing already exists)',
//     ''
// }

class DbError extends Error {
    constructor(value) {
        super()
        this.message = value
    }
}

class AuthorizationError extends Error{
    constructor(message) {
        super(message)
        this.code = 401
    }
}

module.exports = {
    DbError,
    AuthorizationError
}
