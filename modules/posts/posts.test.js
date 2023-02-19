const { createServer } = require('../../server');
const formdata = require('form-auto-content');
const fs = require('node:fs/promises')
const test = require('node:test');
const assert = require('node:assert')

const testFn = async () => {
  const server = await createServer();
  const loginResponse = await server.inject({
    method: "POST",
    url: "/auth/login",
    payload: {ticket: '1111', password: '1111'},
  })

  const {data} = JSON.parse(loginResponse.payload);
  const token = data.token

  const image = await fs.open('assets/bba.jpg')

  const postData = formdata({
    file: image.createReadStream(),
    body: 'testing post',
    title: 'Testing post title',
    tags:  "[\"Sport\", \"Math\"]"
  })

  const res =
    await server
      .inject({
        method: "POST",
        url:'/posts/',
        ...postData,
        headers: {...postData.headers, authorization: `Bearer ${token}`},

      })

  const post = JSON.parse(res.payload)

  assert.strictEqual(postData.title, post.title)
  // assert.strictEqual(postData.title, post.title)
}

test( 'create post', testFn)




