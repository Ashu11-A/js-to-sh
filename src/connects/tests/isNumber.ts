import { isNumber } from '../../transformers/javascript/isNumber.js'

const num = 0

if (isNumber(num)) {
  console.log('é um numero')
}

if (num == '0') {
  console.log('teste')
}

function teste () {
  return 'Hello World'
}

teste()