import { Method } from '../../class/methods.js'

new Method({
  type: 'Property',
  parser(element, options) {
    const key = options.subprocess(element.key.type, element.key) as string
    const value = options.subprocess(element.value.type, element.value) as string

    return [key, value, element.value.type]
  }
})