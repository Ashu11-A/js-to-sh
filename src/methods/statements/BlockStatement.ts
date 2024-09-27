import { Method } from '../../class/methods.js'
import { breakLines } from '../../libs/breakLines.js'

new Method({
  type: 'BlockStatement',
  parser(node, options) {
    const code: (string | number)[] = []

    for (const statement of node.body) {
      const result = options.subprocess(statement.type, statement)
      if (Array.isArray(result)) { code.push(...result); continue }
      code.push(result)
    }

    return breakLines(code)
  }
})