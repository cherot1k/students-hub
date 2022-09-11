
const { createServer } = require('./server.js');
require('dotenv').config();


(async () => {
    const app = await createServer()

    app.listen(process.env.PORT || 2000, '0.0.0.0', function (err){
        if(err) console.log('error',err)
        app.log.info(`server listening on ${process.env.PORT}`)
    })
})()


