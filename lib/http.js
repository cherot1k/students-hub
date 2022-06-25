module.exports = {
    createError: (message) => {
        console.log('error', message)

        const serverMessage = typeof message === "object"? JSON.stringify(message): String(message)
        return JSON.stringify( {
            successful: false,
            message: serverMessage,
            data: null
        })
    },
    createResponse: (data) => {
        console.log('data is', data)

        return JSON.stringify( {
            successful: true,
            data: data,
            message: "",
        })
    }
 }
