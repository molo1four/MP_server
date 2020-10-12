const tape = require('tape')
const fs = require('fs')
const writeArrayToTxtFile = require('../index')
const testFilePath = __dirname + '/test.txt'

tape.test('it creates a txt file with given name, if it does not exist', t => {
  writeArrayToTxtFile(['a', 'b', 'c'], testFilePath, err => {
    fs.access(testFilePath, err => {
      if(err) {
        console.error(err)
        t.fail()
      }
      fs.unlinkSync(testFilePath) // remove test file
      t.pass()
      t.end()
    })
  })
})

tape.test('it will populate txt file with given contents', t => {
  writeArrayToTxtFile(['👍', '✅', '😛'], testFilePath, err => {
    t.equal(fs.readFileSync(testFilePath, 'utf-8'), '👍\n✅\n😛\n')
    fs.unlinkSync(testFilePath) // remove test file
    t.end()
  })
})

tape.test('it will override txt file with given name, if it does exist', t => {
  writeArrayToTxtFile(['a','b','c'], testFilePath, err => {
    writeArrayToTxtFile(['d', 'e', 'f'], testFilePath, err => {
      t.equal(fs.readFileSync(testFilePath, 'utf-8'), 'd\ne\nf\n')
      fs.unlinkSync(testFilePath) // remove test file
      t.end()
    })
  })
})

tape.test('it will write Number type', t => {
  writeArrayToTxtFile([1,2,3], testFilePath, err => {
    t.equal(fs.readFileSync(testFilePath, 'utf-8'), '1\n2\n3\n')
    fs.unlinkSync(testFilePath) // remove test file
    t.end()
  })
})

tape.test('it will write Function type', t => {
  writeArrayToTxtFile([function add(a, b) {return a+b}], testFilePath, err => {
    t.equal(fs.readFileSync(testFilePath, 'utf-8'), 'function add(a, b) {return a+b}\n')
    fs.unlinkSync(testFilePath) // remove test file
    t.end()
  })
})

tape.test('it will write Object type', t => {
  writeArrayToTxtFile([{
    a: 1,
    b: 2,
    c: 'value for key c'
  }], testFilePath, err => {
    t.equal(fs.readFileSync(testFilePath, 'utf-8'), '{"a":1,"b":2,"c":"value for key c"}\n')
    fs.unlinkSync(testFilePath) // remove test file
    t.end()
  })
})

tape.test('if there\'s an error, it will pass error to callback', t => {
  writeArrayToTxtFile({}, testFilePath, err => {
    if(err) {
      t.assert(err, 'error is present')
      fs.unlinkSync(testFilePath) // remove test file
      t.end()
    }
  })
})
