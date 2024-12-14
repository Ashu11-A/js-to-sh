import { Method } from '../../class/methods.js'

new Method({
  type: 'FunctionExpression',
  parser(expression, options) {
    if (!expression.body) {
      console.debug('[FunctionExpression] is null')
      return ''
    }

    return options.subprocess(expression.body.type, expression.body)
  }
})