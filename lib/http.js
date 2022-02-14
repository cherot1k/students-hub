module.exports = {
    createError: (message) => {
        return {
            successful: false,
            message
        }
    },
    createResponse: (data) =>{
        return {
            successful: true,
            data: JSON.stringify(data)
        }
    }
 }
