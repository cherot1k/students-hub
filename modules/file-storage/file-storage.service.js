'use strict'
const clodinary = require('cloudinary').v2
clodinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})
const { Readable } = require('node:stream')
require('dotenv').config()

class FileStorageService {

    async storeFileAndReturnUrl(fileData) {

        return new Promise((resolve, reject) => {
            const imgDataStream = Readable.from(fileData)
            const stream = clodinary.uploader.upload_stream(
                {
                    folder: 'files',
                },
                (err, res) => {
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
}

module.exports = {
    module: {
        service: new FileStorageService(),
        name: 'fileStorage',
    },
}
