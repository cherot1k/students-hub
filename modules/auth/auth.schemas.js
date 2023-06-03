'use strict'

const ticketRegExp = '^[a-zA-Zа-яА-Я]{2}[0-9]{8}'
const groupRegExp = '^[0-9]{1}[A-ZА-Я]{2}-[0-9]{2}[a-zа-я]{2}'
const emailRegExp = '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
const passwordRegExp = '^[a-zA-Zа-яА-Я0-9]{4}'

module.exports =  (fastify) => {
    fastify.addSchema({
        $id: 'login',
        type: 'object',
        properties: {
            ticket: { type: 'string', pattern: ticketRegExp },
            password: { type: 'string', pattern: passwordRegExp },
        },
    })

    fastify.addSchema({
        $id: 'registration',
        type: 'object',
        properties: {
            ticketPhoto: { type: 'string', pattern: ticketRegExp },
            password: { type: 'string', pattern: passwordRegExp },
            email: { type: 'string', pattern: emailRegExp },
            group: { type: 'string', pattern: groupRegExp },
        },
        required: ['ticketPhoto', 'password', 'email', 'group'],
    })

}
