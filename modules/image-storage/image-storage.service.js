const clodinary = require('cloudinary').v2
clodinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret: process.env.API_SECRET
})
const {Readable} = require('node:stream')
require('dotenv').config()

class ImageStorageService{

    async storeImageAndReturnUrl(imageData, uuid){
        let url
        const imgDataStream = Readable.from(imageData)
        const cld_upload_stream = await clodinary.uploader.upload_stream(
            {
                folder: "users",
            },
            (err, res) => {
                if(res){
                    url = res.url
                }else {
                    console.log(err)
                }
            }
        );
        return new Promise((resolve, reject) => {
            let data = "";
            imgDataStream.on('data', (chunk) => console.log('chunk', chunk))
            imgDataStream.pipe(cld_upload_stream).on('end', () => resolve(data));
        })
    }

    async getImageByUrl(){

    }
}

module.exports = {
    module: {
        service: new ImageStorageService(),
        name: 'imageStorage'
    }
}
