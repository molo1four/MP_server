const arrayToTxtFile = require('./index')

arrayToTxtFile(['Hi there', function add(a,b) {return a+b}, {a: 1, b: 2, c: {d: 3}}], './test-output.txt', err => {
    if(err) {
      console.error(err)
      return
    }
    console.log('Successfully wrote to txt file')
})
