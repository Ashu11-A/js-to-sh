import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'

/**
 * Formata Comparações com Operações (==, >=, <=, <, >), usados em if & elif
 *
 * @param {BinaryExpression} node
 * @returns {string}
 */
new Method({
  type: 'BinaryExpression',
  parser(node, options) {
    const left = options.subprocess(node.left.type, node.left) as string
    const right = options.subprocess(node.right.type, node.right) as string
    const operator = Transpiler.parseOperator(node.operator)
    
    const result = `${Transpiler.parseReturnString(node.left.type, left)} ${operator} ${Transpiler.parseReturnString(node.right.type, right)}`
    
    // Possivel erro, isso relamente é um tapa buraco
    if (operator === '+') {
      return `$(( ${result} ))`
    }
    
    return `[[ ${result} ]]`
  }
})