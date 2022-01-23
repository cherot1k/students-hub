const { createWorker } = require('tesseract.js');
const sharp = require('sharp')
const fs = require("fs");
const worker = createWorker();

const LANGUAGES = {
    UA: "ukr",
    EN: "eng"
}

const BLOCKS = [
    {
        name: "ticket",
        language: LANGUAGES.EN,
        rectangle: {
            left: 32,
            top: 217,
            width: 400,
            height: 80,
        }
    },
    {
        name: 'date created',
        language: LANGUAGES.UA,
        rectangle: {
            left: 32,
            top: 373,
            width: 400,
            height: 120,
        }
    },
    {
        name: 'date of ending',
        language: LANGUAGES.UA,
        rectangle: {
            left: 32,
            top: 541,
            width: 400,
            height: 120,
        }
    },
    {
        name: 'full_name',
        language: LANGUAGES.UA,
        rectangle: {
            left: 21,
            top: 713,
            width: 700,
            height: 120,
        }
    },
    {
        name: 'faculty',
        language: LANGUAGES.UA,
        rectangle: {
            left: 21,
            top: 913,
            width: 700,
            height: 180,
        }
    },
    // {
    //     name: 'group',
    //     language: LANGUAGES.UA,
    //     rectangle: {
    //         left: 21,
    //         top: 1149,
    //         width: 700,
    //         height: 100,
    //     }
    // },
    {
        name: 'university',
        language: LANGUAGES.UA,
        rectangle: {
            left: 21,
            top: 10,
            width: 800,
            height: 150,
        }
    }
]

const parseImageData = (imageData) => {
    let data = Object.create(null)
    for(let chunk of imageData){
        Object.values(chunk).forEach(el => el.replace(`\n`, ' '))
        Object.assign(data,chunk)
    }
    return data
}

class ImageRecognitionService{

    async recognizeTicketData(imageData){
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.loadLanguage('ukr');
            const values = [];
            for (const value of BLOCKS) {
                await worker.initialize(value.language);
                const { data: { text } } = await worker.recognize(imageData, { rectangle: value.rectangle });
                values.push({[value.name]: text.replaceAll('\n', ' ')});
            }
            const userImage =  await sharp(imageData).extract({width: 377 , height: 467, top: 194, left: 389}).toBuffer()
            values.push(userImage)
            await worker.terminate();
            return parseImageData(values)
    }
}

module.exports = {
    module: {
        service: new ImageRecognitionService(),
        name: 'imageRecognition'
    }
}





