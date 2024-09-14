import { Transpiler } from '../class/transpiler.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'
import { ArrowFunctionExpression, CallExpression, FunctionDeclaration } from '../../node_modules/meriyah/src/estree.js'

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
  static parseArrowFunctionExpression (expression: ArrowFunctionExpression) {
    const code: string[] = []
    const result = Transpiler.parseExpression(expression.body as CallExpression) as string
    const params = expression.params.map((param) => Transpiler.parseExpression(param))
  
    for (const [index, param] of Object.entries(params)) {
      code.push(getTabs(Transpiler.tabs) + `local ${param}=$${Number(index) + 1}`)
    }
    
    code.push(result)

    return breakLines(code)
  }
}