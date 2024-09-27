import { Method } from '../../class/methods.js'

/**
 * Usado em parseMetaProperty, constante endPropertyName pode ser um PrivateIdentifier
 *
 * @param {PrivateIdentifier} expression
 * @returns {string}
 */
new Method({
  type: 'PrivateIdentifier',
  parser(expression) {
    return expression.name
  }
})