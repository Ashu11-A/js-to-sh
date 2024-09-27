import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'

/**
 * Caso usado em functions isso ira formatar o return da função
 * 
 * Input:
 * const number = 0
 * 
 * function test() {
 *    return number
 * }
 * 
 * Output:
 * number="0"
 * 
 * teste() {
 *  echo $(( "number" ))
 * }
 *
 * @param {ReturnStatement} node
 * @returns {string}
 */
new Method({
  type: 'ReturnStatement',
  parser(node, options) {
    if (node.argument === null) {
      console.debug('[ReturnStatement] node.argument is null')
      return ''
    }
  
    const element = options.subprocess(node.argument.type, node.argument) as string

    return `echo ${Transpiler.parseReturnString(node.argument.type ?? 'Literal', element)}`
  }
})