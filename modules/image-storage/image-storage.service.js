'use strict'
const clodinary = require('cloudinary').v2
clodinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})
const { Readable } = require('node:stream')
require('dotenv').config()

class ImageStorageService {

    async storeImageAndReturnUrl(imageData, uuid) {

        return new Promise((resolve, reject) => {
            const imgDataStream = Readable.from(imageData)
            const stream = clodinary.uploader.upload_stream(
                {
                    folder: 'users',
                },
                (err, res) => {
                    if (res) {
                        resolve(res.url)
                    } else {
                        console.log(err)
                    }
                },
            )

            imgDataStream.pipe(stream).on('end', () => {
            })
        })
    }

    async getImageByUrl() {

    }
}

module.exports = {
    module: {
        service: new ImageStorageService(),
        name: 'imageStorage',
    },
}
