# array-to-txt-file

takes in an array and will write each value to a text file.
Each value is force-converted toString(), and concatenated with a newline.
Objects are written via JSON.stringify output.

## Install
    $ npm install array-to-txt-file


## Example
```
const arrayToTxtFile = require('array-to-txt-file')

arrayToTxtFile(['Hi there', function add(a,b) {return a+b}, {a: 1, b: 2, c: {d: 3}}], './test-output.txt', err => {
    if(err) {
      console.error(err)
      return
    }
    console.log('Successfully wrote to txt file')
})
```
```
test-output.txt:

Hi there
function add(a,b) {return a+b}
{"a":1,"b":2,"c":{"d":3}}
```

## Unit tests

    $ npm test
