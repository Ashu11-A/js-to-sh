// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEmpty =  (content: any) => {
  switch (typeof content) {
  case 'undefined': {
    return true
  }
  default: {
    return false
  }
  }
}
global.isEmpty = isEmpty
export { isEmpty }
