#!/usr/bin/env node
const fs = require('fs')
const _ = require('lodash')

module.exports = function writeArrayToTxtFile(array, txtFilePath, cb) {

  let ws = fs.createWriteStream(txtFilePath)
  let error = null

  ws.on('finish', () => {
    if(error)
      return
    else
      cb(null)
  })

  ws.on('error', err => {
    cb(err)
  })

  try {
    array.forEach(v => {
      if(_.isPlainObject(v)) {
        ws.write(`${JSON.stringify(v)}\n`)
        return
      }
      ws.write(`${v}\n`)
    })
  } catch(ex) {
    error = ex
    cb(ex, null)
  }

  ws.end()

}
