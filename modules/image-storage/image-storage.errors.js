class FileSaveError extends Error{
    constructor(message) {
        super(`Error while saving file ${message}`)
        this.code = 500
    }
}

module.exports = {
    FileSaveError
}
