const {queryBuilder} = require('../../lib/prisma-query-builder')

module.exports = {
    module: {
        name: 'query-builder',
        service: queryBuilder
    }
}
