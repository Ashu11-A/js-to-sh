import { FunctionDeclaration } from 'node_modules/meriyah/src/estree.js'
import { Transpiler } from '@/class/transpiler.js'
import { breakLines } from '@/libs/breakLines.js'
import { getTabs } from '@/libs/getTabs.js'

export class ParseFunction {
  AST: FunctionDeclaration
  functionName: string
  constructor (AST: FunctionDeclaration) {
    this.AST = AST
    this.functionName = this.getFunctionName(this.AST)
  }

  private getFunctionName (AST: FunctionDeclaration) {
    const functionName = Transpiler.parseExpression(AST.id) as string
    return functionName
  }

  /**
   * Formata funções
   * @returns {string}
   */
  parse(): string {
    const code: string[] = []
    const params = this.AST.params.map((param) => Transpiler.parseExpression(param)) as []

    code.push(`function ${getTabs(Transpiler.tabs)}${this.functionName}() {`)

    Transpiler.tabs++
    for (const [index, param] of Object.entries(params)) {
      code.push(`${getTabs(Transpiler.tabs)}local ${param}=$${Number(index) + 1}`)
    }

    code.push(...Transpiler.parseController(this.AST.body).map(output => `${getTabs(Transpiler.tabs)}${output}`))
    Transpiler.tabs--
    code.push(getTabs(Transpiler.tabs) + '}\n')

    return breakLines(code)
  }
}