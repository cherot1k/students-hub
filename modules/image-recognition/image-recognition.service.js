const Tesseract = require('tesseract.js')
const sharp = require('sharp')

const LANGUAGES = {
    UA: 'ukr',
    EN: 'eng',
}

const BLOCKS = [
    {
        name: 'ticket',
        language: LANGUAGES.EN,
        rectangle: {
            left: 32,
            top: 217,
            width: 400,
            height: 80,
        },
    },
    {
        name: 'date created',
        language: LANGUAGES.UA,
        rectangle: {
            left: 32,
            top: 373,
            width: 400,
            height: 120,
        },
    },
    {
        name: 'date of ending',
        language: LANGUAGES.UA,
        rectangle: {
            left: 32,
            top: 541,
            width: 400,
            height: 120,
        },
    },
    {
        name: 'full_name',
        language: LANGUAGES.UA,
        rectangle: {
            left: 21,
            top: 713,
            width: 700,
            height: 120,
        },
    },
    {
        name: 'faculty',
        language: LANGUAGES.UA,
        rectangle: {
            left: 21,
            top: 913,
            width: 700,
            height: 180,
        },
    },
    {
        name: 'university',
        language: LANGUAGES.UA,
        rectangle: {
            left: 21,
            top: 10,
            width: 800,
            height: 150,
        },
    },
]

const parseImageData = (imageData) => {
    const data = Object.create(null)
    for (const chunk of imageData) {
        Object
            .values(chunk)
            .forEach(
                (el) => typeof el === 'string'
                    ? el.replace('\n', ' ')
                    : el,
            )
        Object.assign(data, chunk)
    }
    return data
}

class ImageRecognitionService {

    async recognizeTicketData(imageData) {
        try{
            const values = []
            for (const value of BLOCKS) {
                const { data: { text } } =
                  await Tesseract.recognize(
                    imageData,
                    'ukr'
                    // { rectangle: value.rectangle },
                  )
                values.push({ [value.name]: text.replaceAll('\n', ' ') })
            }
            const userImage =
              await sharp(imageData)
                .extract({ width: 377, height: 467, top: 194, left: 389 })
                .toBuffer()
            values.push({ userImage })
            return parseImageData(values)
        }catch (e) {
            console.log('errorssss', e)
            throw e
        }

    }
}

module.exports = {
    module: {
        service: new ImageRecognitionService(),
        name: 'imageRecognition',
    },
}





