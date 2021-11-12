const fs = require('fs')
const path = require('path')


const jsFileMatch = /\.js/

function loadModule({ matchPattern, callback, filepath, importName}){
    fs.readdir( filepath , (err, files) => {
      if(err){
        return console.log("Error while loading files")
      }
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
    })
}

module.exports = {
  loadModule
}