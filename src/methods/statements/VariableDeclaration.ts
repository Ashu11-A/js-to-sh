import { Colors } from '@loggings/beta'
import type { AwaitExpression } from '../../../node_modules/meriyah/dist/src/estree.js'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { ParserClass } from '../expressions/ClassDeclaration.js'

/**
 * Formata Declarações
 *
 * @param {VariableDeclaration} node
 * @returns {string}
 */
new Method({
  type: 'VariableDeclaration',
  parser(node, options) {
    const code: string[] = []
    for (const variable of node.declarations) {
      const variableName = options.subprocess(variable.id.type, variable.id) as string
      if (variable.init === null) { code.push(variableName); continue }

      // Caso seja um ArrowFunctionExpression, então será uma função, por isso adicione a indentação
      if (variable.init.type === 'ArrowFunctionExpression') Transpiler.tabs++
      const intNode = options.subprocess(variable.init.type, variable.init) as string
      if (variable.init.type === 'ArrowFunctionExpression') Transpiler.tabs--

      /**
       * Quando usar const data = await fetchShell()
       * o tipo dele será AwaitExpression, mas isso é só um intermediário para CallExpression, por isso usamos: variable.init.argument.type
       */
      const variableOutput = Transpiler.parseReturnString(variable.init.type === 'AwaitExpression' ? (variable.init as AwaitExpression).argument.type : variable.init.type ?? 'Literal', intNode)

      // Veja parseNewExpression
      if (variableOutput.includes('(ARG)') && variable.init.type === 'NewExpression') {
        const className = options.subprocess(variable.init.callee.type, variable.init.callee) as string
        const parserClass = ParserClass.all.get(className) as ParserClass

        if (parserClass === undefined) {
          console.debug(Colors('red', `[${className}] Not implemented`))
        } else {
          parserClass.constant = variableName
        }

        code.push(`\n${variableName}="${className}_${crypto.randomUUID().replaceAll('-', '')}"`)
        code.push((intNode as string).replaceAll('(ARG)', `$${variableName}`) + '\n')
        continue
      }

      /**
       * Em ArrowFunctionExpression, a declaração de uma constante é irrelevante, por isso declaramos ela como se fosse
       * uma function normal
       * 
       * Input:
       * const func = () => console.log('ArrowFunctionExpression')
       * 
       * Output:
       * function func() {
       *   echo "ArrowFunctionExpression"
       * }
       */
      if (variable.init.type === 'ArrowFunctionExpression') {
        code.push(`function ${variableName} () {`)
        code.push(variableOutput)
        code.push('}')
      } else {
        code.push(`${variableName}=${variableOutput}`)
      }
    }
    return breakLines(code)
  }
})