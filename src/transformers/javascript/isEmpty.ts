// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmpty (content: any) {
  switch (typeof content) {
  case 'undefined': {
    return true
  }
  default: {
    return false
  }
  }
}