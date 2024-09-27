import { Method } from '../../class/methods.js'
import { breakLines } from '../../libs/breakLines.js'

new Method({
  type: 'ExpressionStatement',
  parser(node, options) {
    const code: string[] = []
    const expression = node.expression
    
    // Isso irá para CallExpression
    code.push(options.subprocess(expression.type, expression) as string)
    return breakLines(code)
  }
})