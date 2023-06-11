class AuthorizationError extends Error{
    constructor(msg) {
        super(msg)
        this.code = 401
    }
}

class NotAllowedError extends Error{
    constructor(msg) {
        super(msg)
        this.code = 403
    }
}

class ValidationError extends Error{
    constructor(msg) {
        super(msg)
        this.code = 400
    }
}

module.exports = {
    AuthorizationError,
    NotAllowedError,
    ValidationError
}
