import { Transpiler } from '../class/transpiler.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'
import { Colors } from '@loggings/beta'
import { AssignmentExpression, ClassBody, ClassDeclaration, FunctionExpression, MethodDefinition, NewExpression } from '../../node_modules/meriyah/src/estree.js'

export class ParserClass {
  static all = new Map<string, ParserClass>() // será usado em parseVariableDeclaration
  AST: ClassDeclaration
  className: string
  // methodNames: string[]
  constant!: string // setá definido em parseVariableDeclaration
  variables: string[]
  uuid: string = crypto.randomUUID().replaceAll('-', '')

  constructor (AST: ClassDeclaration) {
    this.AST = AST
    this.className = this.getClassName(this.AST)
    this.variables = this.getVariables(this.AST)
    ParserClass.all.set(this.className, this)
  }

  private getClassName (classs: ClassDeclaration) {
    const className = Transpiler.parseExpression(classs.id) as string
    return className
  }

  private getVariables (classs: ClassDeclaration) {
    const variables: string[] = []

    for (const node of classs.body.body) {
      if (node.type ===  'MethodDefinition') {
        const module = (node as MethodDefinition)

        const { variables: variablesArray } = this.parseClassMethodDefinition(module)
        variables.push(...variablesArray)
      }
    }

    return variables
  }

  parseClassDeclaration () {
    const code: string[] = []
    Transpiler.tabs++
    const regexConstructor = /START_CONSTRUCTOR([\s\S]*?)END_CONSTRUCTOR/g

    code.push(`\n${getTabs(Transpiler.tabs -1)}function ${this.className}_new () {`)
    code.push(`${getTabs(Transpiler.tabs)}local self=$1`)

    const match = regexConstructor.exec((this.parseClassBody(this.AST.body) as string))?.[1].trim()
    code.push(match ? getTabs(Transpiler.tabs) + match : '')
    
    Transpiler.tabs--
    code.push(`${getTabs(Transpiler.tabs)}}`)

    const methods = this.parseClassBody(this.AST.body) as string
    const formated = methods
      .replace(regexConstructor, '')
      .replaceAll('(CLASS)', this.className + '_').toString()
      .replaceAll('local self=$1', `local self=$1\n${this.variables.map((variable) => `${getTabs(Transpiler.tabs + 1)}local ${variable}=$(eval echo \\$$$self"_${variable}")\n`).join('')}`)

    code.push(formated)
    return breakLines(code)
  }

  /**
   * As classes precisam de uma formatação muito especifica, então parseFunctionExpression não funcionaria
   *
   * @param {FunctionExpression} expression
   * @returns {string[]}
   */
  parseClassFunctionExpression (expression: FunctionExpression): string[] {
    const values = expression.params.map((param) => Transpiler.parseExpression(param)) as string[]
    return values
  }

  parseClassBody(classs: ClassBody) {
    const code: string[] = []
    for (const element of classs.body) {
      switch (element.type) {
      case 'FunctionExpression': {

        break
      }
      case 'MethodDefinition': {
        const { code: codeString } = this.parseClassMethodDefinition(element as MethodDefinition)
        code.push(codeString)
        break
      }
      // case 'PropertyDefinition': {
      //   break
      // }
      // case 'StaticBlock': {
      //   break
      // }
      default: {
        console.debug(Colors('red', `[parseClassBody] ${element.type}`))
      }
      }
    }

    return breakLines(code)
  }

  parseClassMethodDefinition (element: MethodDefinition) {
    const code: string[] = []
    const variables: string[] = []
    const key = Transpiler.parseExpression(element.key)
    let elements = 2
  
    switch (element.kind) {
    case 'method': {
      const result = Transpiler.parseExpression(element.value) as string
  
      code.push(`${getTabs(Transpiler.tabs)}function (CLASS)${key} {`)
      Transpiler.tabs++
      code.push(`${getTabs(Transpiler.tabs)}local self=$1`)
      code.push(`${getTabs(Transpiler.tabs)}${result}`)
      Transpiler.tabs--
      code.push(`${getTabs(Transpiler.tabs)}}`)
      break
    }
    case 'get': {
      break
    }
    case 'set': {
      break
    }
    case 'constructor': {
      const values = this.parseClassFunctionExpression(element.value)

      code.push('START_CONSTRUCTOR')
      for (const variable of values) {
        variables.push(variable)
        code.push(`${getTabs(Transpiler.tabs)}eval "$self"_${variable}='$${elements++}'`)
      }
      code.push('END_CONSTRUCTOR')
    }
    }

    return { code: breakLines(code), variables }
  }
  
  /**
   * Usado para formatar variaveis dentro de classes
   * 
   * class Exemple {
   *  public string = 'this'
   * }
   *
   * @param {AssignmentExpression} expression
   */
  parseAssignmentExpression (expression: AssignmentExpression) {
    const right = Transpiler.parseExpression(expression.right)
    // const left = this.parseExpression(expression.left) // MemberExpression
    // const operador = this.parseOperator(expression.operator)
  
    return `${getTabs(Transpiler.tabs)}${right}`
  }
  
  /**
   * Estrutura a classe
   * 
   * Input: const pessoa = new Pessoa('Matheus', '18')
   * 
   * Output:
   * pessoa="pessoa"
   * Pessoa_new $pessoa "Matheus" 18
   *
   * @param {NewExpression} expression
   * @returns {string}
   */
  static parseNewExpression (expression: NewExpression): string {
    const className = Transpiler.parseExpression(expression.callee) as string
    const args = expression.arguments.map((arg) => Transpiler.parseReturnString(arg.type, Transpiler.parseExpression(arg) as string))

    /**
     * (ARG): será substituido em parseVariableDeclaration, lá será definido o this.constant dessa class (ParserClass)
     */
    return `${className}_new (ARG) ${args.join(' ')}`
  }
}