import { Method } from '../../class/methods.js'

/**
 * Retorna o identificador das constantes
 *
 * @param {Identifier} expression
 * @returns {string}
 */
new Method({
  type: 'Identifier',
  parser (expression) {
    return expression.name
  }
})