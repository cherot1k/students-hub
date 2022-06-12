const {request} = require('undici')

const BASE_URL = `${process.env.HOST}:${process.env.PORT}`
const GET_TAGS_ROUTE = '/posts/tags'

class GlobalService {
    async getInitAppData() {
        try{
            const {body: tagsBody, statusCode} = await request(
                `${BASE_URL}${GET_TAGS_ROUTE}`,
                {
                    method: 'GET'
                }
            )

            const data = await tagsBody.json()

            const tags = data.data?.tags

            return {
                formValues: {
                    postTags: tags
                }
            }
        }catch (e) {
            console.log('err', e)
        }
    }
}

module.exports = {
    module: {
        service: new GlobalService(),
        name: 'globalService'
    }
}
