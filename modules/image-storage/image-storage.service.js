const clodinary = require('cloudinary').v2
clodinary.config({
    cloud_name: 'dts7nyiog',
    api_key : '284391289715389',
    api_secret: 'XGSdsaQaJI0SYzTluTs2B9oNV_I'
})
const USER_PHOTO_DIR = "/user"
const {Readable} = require('node:stream')
const fs = require('node:fs')
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
        return await imgDataStream.pipe(cld_upload_stream)
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
