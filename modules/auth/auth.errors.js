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

module.exports = {
    DbError,
}
