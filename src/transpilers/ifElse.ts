import { Transpiler } from '../class/transpiler.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'
import { IfStatement, Statement } from '../../node_modules/meriyah/src/estree.js'

export class ParseIFs {
  AST: IfStatement
  constructor (AST: IfStatement) {
    this.AST = AST
  }

  /**
    * Formata todos os If para shell script
    *
    * @param {IfStatement} expression
    */
  parseIfStatement() {
    Transpiler.tabs++

    const test = Transpiler.parseExpression(this.AST.test)
    const consequent = Transpiler.parseController(this.AST.consequent)
    const alternate = this.AST.alternate ? this.parseElseStatement(this.AST.alternate) : ''
    const code: string[] = []

    code.push(`${Transpiler.tabs >= 1 ? '\n' : ''}if ${test}; then`)
    code.push(`${breakLines(consequent?.map(content => `${getTabs(Transpiler.tabs)}${content}`).filter((content) => content.length === 0 ? false : true))}`)
    if (alternate.length > 0) code.push(alternate)
    code.push(`fi${Transpiler.tabs >= 1 ? '\n' : ''}`)

    Transpiler.tabs--
    return breakLines(code)
  }

  /**
   * Usado para pegar recursivamente todos os else do javascript
   * @param node 
   * @returns 
   */
  parseElseStatement(expression: Statement) {
    const content: string[] = []
    if (expression.type !== 'IfStatement') {
      content.push(getTabs(Transpiler.tabs - 1) + 'else')
      const result = Transpiler.parseStatement(expression)

      if (Array.isArray(result)) {
        result.map((result) => content.push(getTabs(Transpiler.tabs) + result))
      } else {
        content.push(getTabs(Transpiler.tabs) + String(result))
      }

      return breakLines(content)
    }
  
    content.push(`elif [[ ${Transpiler.parseExpression(expression.test)} ]]; then`)
    content.push(`${getTabs(Transpiler.tabs)}${Transpiler.parseController(expression.consequent)}`)
    
    if (expression.alternate) content.push(this.parseElseStatement(expression.alternate))
    return breakLines(content)
  }
}