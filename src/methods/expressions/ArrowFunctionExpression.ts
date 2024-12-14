import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'

/**
 * Formata funções declaradas em constantes, aqui é somente uma ponte, isso vai para CallExpression
 * 
 * Input:
 * const func = () => console.log('ArrowFunctionExpression')
 * 
 * Output:
 * function func() {
 *   echo "ArrowFunctionExpression"
 * }
 */
new Method({
  type: 'ArrowFunctionExpression',
  parser(expression, options) {
    const code: string[] = []
    const result = options.subprocess(expression.body.type, expression.body) as string
    const params = expression.params.map((param) => options.subprocess(param.type, param))
      
    Transpiler.tabs++
    for (const [index, param] of Object.entries(params)) {
      code.push(`${getTabs(Transpiler.tabs)}local ${param}=$${Number(index) + 1}`)
    }
    Transpiler.tabs--

    code.push(result)
    
    return breakLines(code)
  }
})