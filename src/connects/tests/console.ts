const text = 'exemplo'

console.log(text, 'log')
console.warn(text, 'warn')
console.error(text, 'error')
console.info(text, 'info')
console.debug(text, 'debug')

console.log('\nCount\n')

console.count('teste')
console.count()
console.count()

console.log('\nReset Count\n')

console.countReset('teste')
console.countReset()

console.log('\nTime\n')

console.time('teste')
console.timeEnd('teste')
console.time()
console.timeEnd()

console.log('\nGroup\n')

console.log('This is the outer level')
console.group()
console.log('Level 2')
console.group()
console.log('Level 3')
console.warn('More of level 3')
console.groupEnd()
console.log('Back to level 2')
console.groupEnd()
console.log('Back to the outer level')