import { IfStatement, Statement } from 'node_modules/meriyah/src/estree.js'
import Transpiler from 'src/class/transpiler.js'
import { breakLines } from 'src/libs/breakLines.js'
import { getTabs } from 'src/libs/getTabs.js'

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
    code.push(`${breakLines(consequent.map(content => `${getTabs(Transpiler.tabs)}${content}`).filter((content) => content.length === 0 ? false : true))}`)
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
    if (expression.type !== 'IfStatement') return ''

    const content: string[] = []
  
    content.push(`elif [[ ${Transpiler.parseExpression(expression.test)} ]]; then`)
    content.push(`${getTabs(Transpiler.tabs)}${Transpiler.parseController(expression.consequent)}`)
    
    if (expression.alternate) content.push(this.parseElseStatement(expression.alternate))
    return breakLines(content)
  }
}