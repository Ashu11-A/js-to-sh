import { Transpiler } from '../class/transpiler.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'
import { ForOfStatement, VariableDeclaration } from '../../node_modules/meriyah/src/estree.js'

export class ParseLoops {
  constructor(public ATS: ForOfStatement) {}

  /**
   * Formata For of
   * 
   * Input:
   * const numbers = [0, 2, 4]
   * 
   * for (const number of numbers) {
   *   console.debug(number)
   * }
   * 
   * Output:
   * numbers=(0 2 4)
   * 
   * for number in "${numbers[@]}"; do
   *   echo "$number"
   * done
   *
   * @returns {string}
   */
  parseForOfStatement(): string {
    const code: string[] = []
    const left = Transpiler.parseStatement(this.ATS.left as VariableDeclaration)
    const right = Transpiler.parseExpression(this.ATS.right)
    const body = Transpiler.parseController(this.ATS.body)

    code.push(`\n${getTabs(Transpiler.tabs)}for ${left} in "$\{${right}[@]}"; do`)
    Transpiler.tabs = Transpiler.tabs + 1
    code.push(...body.map((content) => `${getTabs(Transpiler.tabs)}${content}`))
    Transpiler.tabs = Transpiler.tabs - 1
    code.push(`${getTabs(Transpiler.tabs)}done`)
    return breakLines(code)
  }
}