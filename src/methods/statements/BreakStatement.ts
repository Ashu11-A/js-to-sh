import { Method } from '../../class/methods.js'

new Method({
  type: 'BreakStatement',
  parser(node, options) {
    if (node?.label === null) {
      console.debug('[BreakStatement]: Label is null')
      return ''
    }

    return options.subprocess('Identifier', node.label)
  }
})