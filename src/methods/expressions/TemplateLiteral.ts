import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'

/**
 * Converte strings dinamicas que usam: ``
 *
 * @param {TemplateLiteral} expression
 * @returns {string}
 */
new Method({
  type: 'TemplateLiteral',
  parser(expression, options) {
    const code: string[] = []

    /*
    * Quasis são os elementos que vem antes ou depois de uma constante declarada dentro de ``
    * Ex: return `${text} ${text}`
    *     return `quasis${text}quasis${text}quasis`
    * Serve para preservar o expaçamento correto das strings
    */
    for (const [index, element] of Object.entries(expression.quasis)) {
      code.push(element.value.raw)
    
      if (Number(index) < expression.expressions.length) {
        const content = expression.expressions[Number(index)]
        const value = Transpiler.parseReturnString(content.type, options.subprocess(content.type, content) as string)
        code.push(value)
      }
    }
    
    return code.join('')
  }
})