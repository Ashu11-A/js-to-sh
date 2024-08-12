import { isNumber } from '../../transformers/javascript/isNumber.js'

const num = 0

if (isNumber(num)) {
  console.log('é um numero')
}

function teste () {
  return 'Hello World'
}

teste()