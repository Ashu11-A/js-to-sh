const isTrue = true
const isFalse = false

if (isFalse === isTrue) {
  console.log('isFalse é diferente de isTrue')
  if ('test' === 'test') {
    console.log('test é test')
  }
} else if (isFalse === isTrue) {
  console.log('isFalse é igual a isTrue')
} else if (true === true) {
  console.log('true é true')
}