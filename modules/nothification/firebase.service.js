'use strict'
const admin = require('firebase-admin')
const account = require('../../config/students-hub-82414-firebase-adminsdk-s0zzu-6f4c2eec2f.json')
const LRU = require('lru-cache')

const opts = {
    max: 5000,
}
const cache = new LRU(opts);

class FirebaseService {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(account),
        })
    }

    async sendMessage(message) {
        const result = await admin.messaging().send(message)
        return result
    }

    async sendMessages(messages) {
        if(messages.length === 0) return
        const result = await admin.messaging().sendAll(messages)
        return result
    }

    async sendMessagesWithDebounce(message, symbol, debounce){
        const prevTimeoutId = cache.get(symbol)
        if(prevTimeoutId){
            clearTimeout(prevTimeoutId)
        }

        const timeoutId = setTimeout(async () => {
            await admin.messaging().send(message)
        }, debounce)

        cache.set(symbol, timeoutId)
    }

    generateMessageFromString(){

    }
}


module.exports = {
    module: {
        service: new FirebaseService(),
        name: 'firebaseService'
    }
}
