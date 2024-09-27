import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'

/**
 * Isso é usado apenas em IfStatement diretamente.
 * Usado para pegar recursivamente todos os else do javascript
 * @param node 
 * @returns 
 */
new Method<'ElseStatement' | 'IfStatement'>({
  type: 'ElseStatement',
  parser(expression, options) {
    const content: string[] = []
    if (expression.type !== 'IfStatement') {
      content.push(getTabs(Transpiler.tabs - 1) + 'else')
      const result = options.subprocess(expression.type, expression)
        
      if (Array.isArray(result)) {
        result.map((result) => content.push(result))
      } else {
        content.push(result)
      }
        
      return breakLines(content)
    }
        
    content.push(`elif [[ ${options.subprocess(expression.test.type, expression.test)} ]]; then`)
    content.push(`${getTabs(Transpiler.tabs)}${options.subprocess(expression.consequent.type, expression.consequent)}`)
        
    if (expression.alternate) content.push(options.subprocess(expression.alternate.type, expression.alternate) as string)
    return breakLines(content)
  }
})