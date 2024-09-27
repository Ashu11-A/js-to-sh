import { Method } from '../../class/methods.js'

/**
 * Retorna o literal das constantes
 *
 * @param {Literal} expression
 * @returns {string}
 */
new Method({
  type: 'Literal',
  parser(expression) {
    return expression.value as string
  }
})