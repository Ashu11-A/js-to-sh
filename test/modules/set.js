const set = new Set()

set.add('test')

if (set.has('test')) {
  console.log('keys: ', set.keys())
  console.log('entries: ', set.entries())
  console.log('size: ', set.size)
  console.log('clear: ', set.clear())
  console.log('delete: ', set.delete('test'))
  console.log('keys: ', set.keys())
}