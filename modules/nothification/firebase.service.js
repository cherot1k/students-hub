const admin = require('firebase-admin')

const account = require('../../config/students-hub-82414-firebase-adminsdk-s0zzu-6f4c2eec2f.json')

class FirebaseService{
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(account)
        })
    }

    async sendMessage(message){
        const result = await admin.messaging().send(message)
        return result
    }

    async sendMessages(messages){
        const result = await admin.messaging().sendAll(messages)
    }
}



// module.exports = {
//     module: {
//         service: new FirebaseService(),
//         name: 'firebaseService'
//     }
// }
