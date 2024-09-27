import { Method } from '../../class/methods.js'

/**
 * Formata arrays (listas)
 *
 * @param {ArrayExpression} expression
 * @returns {string}
 */
new Method({
  type: 'ArrayExpression',
  parser (expression, options) {
    const elements = expression.elements.map((element) => element === null ? '' : options.subprocess(element.type, element))
    return elements as string[]
  }
})