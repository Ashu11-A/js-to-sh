import { SwitchStatement } from 'node_modules/meriyah/src/estree.js'
import Transpiler from 'src/class/transpiler.js'
import { breakLines } from 'src/libs/breakLines.js'
import { getTabs } from 'src/libs/getTabs.js'

export class ParserSwitch {
  AST: SwitchStatement
  constructor (AST: SwitchStatement) {
    this.AST = AST
  }

  /**
   * Formata switchs
   *
   * @param {SwitchStatement} node
   * @returns {string}
   */
  parse(): string {
    const code: string[] = []
    const discriminant = Transpiler.parseExpression(this.AST.discriminant)
    
    code.push(`${getTabs(Transpiler.tabs)}case $${discriminant} in`)
    Transpiler.tabs++

    for (const caseNode of this.AST.cases) {
      Transpiler.tabs++
      if (caseNode.test) {
        const testValue = Transpiler.parseExpression(caseNode.test)
        code.push(`${getTabs(Transpiler.tabs)}"${testValue}")`)
      } else {
        code.push(getTabs(Transpiler.tabs) + '*))')
      }
    
      Transpiler.tabs++
    
      code.push(getTabs(Transpiler.tabs) + breakLines(Transpiler.parseController(...caseNode.consequent)))
      code.push(getTabs(Transpiler.tabs) + ';;')
    
      Transpiler.tabs--
      Transpiler.tabs--
    }
    code.push(getTabs(Transpiler.tabs) + 'esac')
    Transpiler.tabs--
    return breakLines(code)
  }
}