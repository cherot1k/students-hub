const firebaseModule = require('./firebase.service')
const firebaseService = firebaseModule.module.service
const test = require('node:test');
const assert = require('node:assert')

test('is messaging fine', async() => {

  const promisifyTimeout = (fn, delay) => new Promise(((resolve, reject) => {
    setTimeout(() => {
      fn()
      resolve()
    },delay)
  }))

  let timesCalled = 0

  const oldClearTimeout = clearTimeout;

  const mockedClearTimeout = (timer) => {
    oldClearTimeout(timer)
    timesCalled += 1
  }

  global.clearTimeout = mockedClearTimeout

  await firebaseService.sendMessagesWithDebounce({hey: 'yo'}, 'sup', 10000)

  await promisifyTimeout(async () => {
    await firebaseService.sendMessagesWithDebounce({hey: 'yo'}, 'sup', 10000)
  }, 9000)

  global.clearTimeout = oldClearTimeout

  assert.strictEqual(timesCalled, 1)
})

// const whatever = async () => {
//   await firebaseService.sendMessagesWithDebounce({hey: 'yo'}, 'sup', 10000)
//   setTimeout(async () => {
//     await firebaseService.sendMessagesWithDebounce({hey: 'yo'}, 'sup', 10000)
//   } ,9000)
// }
//
// whatever()