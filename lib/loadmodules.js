const fs = require('fs')
const path = require('path')


const jsFileMatch = /\.js/

function loadModule({ matchPattern, callback, filepath, importName}){
     const files =  fs.readdirSync( filepath )
      files.forEach(filename => {
        if(matchPattern.test(filename)){
          const file = require(path.join(filepath, filename))
          if(file[importName]){
            callback(file[importName])
          }
          return
        }
        if(!jsFileMatch.test(filename)) return loadModule({ matchPattern, callback, filepath: path.join( filepath ,filename), importName})
      })

}

module.exports = {
  loadModule
}
