import { Method } from '../../class/methods.js'

/**
 * Adiciona wait ao código para esperar o seu resultado.
 *
 * @static
 * @param {AwaitExpression} expression
 * @returns {string}
 */
new Method({
  type: 'AwaitExpression',
  parser(expression, options) {
    return options.subprocess(expression.argument.type, expression.argument)
  }
})