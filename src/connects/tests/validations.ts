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

// import { join } from 'path'
// import { isFile } from '../../transformers/javascript/isFile.js'

// const path = join(import.meta.dirname, './isNumber.js')

// console.log(await isFile(path), path)

// if (await isFile(path)) {
//   console.log('asdhkashbd')
// }