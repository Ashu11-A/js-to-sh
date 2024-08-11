export function isEmpty (content) {
  switch (typeof content) {
  case 'string': {
    if (content.length === 0) {
      return true
    }
    return false
  }
  case 'undefined': {
    return true
  }
  }
}