'use strict'
const clodinary = require('cloudinary').v2
clodinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})
const { Readable } = require('node:stream')
const {FileSaveError} = require('./image-storage.errors')
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
                    if(err) reject(new FileSaveError(err.toString()))
                    if (res) {
                        resolve(res.url)
                    } else {
                        reject()
                        console.log(err)
                    }
                },
            )

            imgDataStream.pipe(stream).on('end', () => {})
        })
    }

    async uploadBase64(base64String){
        const res = await clodinary.uploader.upload(base64String, {
            overwrite: true,
            invalidate: true,
            width: 810, height: 456, crop: "fill"
        })
        return res.url
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
