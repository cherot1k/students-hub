module.exports = {
    createError: (message) => {
        return JSON.stringify( {
            successful: false,
            message
        })
    },
    createResponse: (data) =>{
        return JSON.stringify( {
            successful: true,
            data: JSON.stringify(data)
        })
    }
 }
