import { isNumber } from '../../transformers/javascript/isNumber.js'

function some (num1, num2) {
  return num1 + num2
}

const result = some(isNumber('a'), isNumber('v'))

console.log(result)