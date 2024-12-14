import { Colors } from '@loggings/beta'
import type {
  AssignmentExpression,
  ClassBody,
  ClassDeclaration,
  FunctionExpression,
  MethodDefinition
} from '../../../node_modules/meriyah/dist/src/estree.js'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'
import type { ASTMap, MethodProps, MethodTypes } from '../../types/methods.js'

// Registering the class parsing method
new Method({
  type: 'ClassDeclaration',
  parser(expression, options) {
    return new ParserClass(expression, options).parseClassDeclaration()
  }
})

export class ParserClass {
  static all = new Map<string, ParserClass>() // será usado em parseVariableDeclaration
  AST: ClassDeclaration
  className: string
  variables: string[]
  uuid = crypto.randomUUID().replaceAll('-', '')

  constructor(
    AST: ClassDeclaration,
    public options: MethodProps<'ClassDeclaration', undefined> & {
      subprocess<T extends MethodTypes, D>(
        methodType: T,
        node: ASTMap[T],
        data?: D
      ): string | string[];
    }
  ) {
    this.AST = AST
    this.className = this.getClassName(this.AST)
    this.variables = this.getVariables(this.AST)
  }

  private getClassName(classDecl: ClassDeclaration): string {
    if (!classDecl.id) {
      throw new Error('[getClassName] classDecl.id is null')
    }

    return this.options.subprocess(classDecl.id.type, classDecl.id) as string
  }

  private getVariables(classDecl: ClassDeclaration): string[] {
    return classDecl.body.body
      .filter((node) => node.type === 'MethodDefinition')
      .flatMap((node) => this.parseClassMethodDefinition(node as MethodDefinition).variables)
  }

  parseClassDeclaration(): string {
    const code: string[] = []

    Transpiler.tabs++

    code.push(
      `\n${getTabs(Transpiler.tabs - 1)}new_${this.className} () {`,
      `${getTabs(Transpiler.tabs)}local self=$1`
    )
    
    const methods = this.parseClassBody(this.AST.body) as string
    
    code.push(methods)
    Transpiler.tabs--
    code.push(`${getTabs(Transpiler.tabs)}}`)
    return breakLines(code)
  }

  private parseClassBody(classBody: ClassBody): string {
    const code: string[] = []

    for (const element of classBody.body) {
      if (element.type === 'MethodDefinition') {
        code.push(
          this.parseClassMethodDefinition(element as MethodDefinition).code
        )
      } else {
        console.debug(Colors('red', `[parseClassBody] Unsupported type: ${element.type}`))
      }
    }

    return breakLines(code)
  }

  private parseClassMethodDefinition(element: MethodDefinition) {
    const code: string[] = []
    const variables: string[] = []

    if (!element.key) throw new Error('[parseClassMethodDefinition] element.key is null')
    const key = this.options.subprocess(element.key.type, element.key)

    switch (element.kind) {
    case 'method':
      this.generateMethodCode(element, key, code)
      break

    case 'constructor':
      this.generateConstructorCode(element, variables, code)
      break

    default:
      console.debug(Colors('yellow', `[parseClassMethodDefinition] Unsupported kind: ${element.kind}`))
    }

    return { code: breakLines(code), variables }
  }

  private generateMethodCode(
    element: MethodDefinition,
    key: string | string[],
    code: string[]
  ) {
    const result = this.options.subprocess(
      element.value.type,
      element.value
    ) as string

    code.push(
      `${getTabs(Transpiler.tabs)}eval "\${self}_${key}() {`,
      `${getTabs(Transpiler.tabs + 1)}${result.replaceAll('"', '\\"')}`,
      `${getTabs(Transpiler.tabs)}}"`
    )
  }

  private generateConstructorCode(
    element: MethodDefinition,
    variables: string[],
    code: string[]
  ) {
    const params = this.parseClassFunctionExpression(element.value)

    for (const [index, param] of Object.entries(params)) {
      const paramIndex = Number(index) + 2

      variables.push(param)
      code.push(
        `${getTabs(Transpiler.tabs)}local ${param}=$${paramIndex}${params.length < paramIndex ? '\n' : ''}`,
      )
    }
  }

  private parseClassFunctionExpression(expression: FunctionExpression): string[] {
    return expression.params.map((param) =>
      this.options.subprocess(param.type, param)
    ) as string[]
  }

  parseAssignmentExpression(expression: AssignmentExpression): string {
    const right = this.options.subprocess(
      expression.right.type,
      expression.right
    )

    return `${getTabs(Transpiler.tabs)}${right}`
  }
}