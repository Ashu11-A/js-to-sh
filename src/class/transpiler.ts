import AbstractSyntaxTree from 'abstract-syntax-tree'
import c from 'chalk'
import { readFileSync, writeFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { ClassDeclaration, NewExpression } from 'node_modules/meriyah/dist/src/estree.js'
import { basename, dirname, join, resolve } from 'path'
import { ParserClass } from 'src/transpilers/class.js'
import terminalLink from 'terminal-link'
import { ArrayExpression, BinaryExpression, BlockStatement, BlockStatementBase, BreakStatement, CallExpression, DeclarationStatement, Expression, ExpressionStatement, ForOfStatement, FunctionDeclaration, FunctionExpression, Identifier, IfStatement, ImportDeclaration, Literal, MemberExpression, MetaProperty, Parameter, PrivateIdentifier, ReturnStatement, SpreadElement, Statement, SwitchStatement, TemplateLiteral, VariableDeclaration } from '../../node_modules/meriyah/src/estree.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'
import { Console } from '../modules/console.js'
import { ParseFunction } from 'src/transpilers/funtion.js'
import { ParseIFs } from 'src/transpilers/ifElse.js'
import { ParserSwitch } from 'src/transpilers/switch.js'

interface TransformOptions {
  path: string
  debug?: boolean
}

export default class Transpiler {
  static tabs: number = 0
  static options: TransformOptions

  constructor(options: TransformOptions) {
    Transpiler.options = options

    if (options.debug) console.log(c.hex('#f9f871')('Debug Mode!'))
    console.log(c.hex('#845ec2')('Compiling:'), c.hex('#ffc75f')(terminalLink(basename(Transpiler.options.path), Transpiler.options.path)))
  }

  /**
   * Carrega o AST do javascript, gera um json com todas as informações necessarias para a conversão para shell script
   *
   * @async
   * @param {string | undefined} code
   * @returns {Promise<(Statement | DeclarationStatement)>}
   */
  async loader(code?: string): Promise<(Statement | DeclarationStatement)> {
    if (code === undefined) code = await readFile(Transpiler.options.path, { encoding: 'utf-8' })
    const AST = new AbstractSyntaxTree(code)
    return AST
  }

  static parser (ast: (Statement | DeclarationStatement)) {
    const code: string[] = []

    code.push('#!/bin/bash\n')
    code.push(...this.parseController(ast))

    writeFileSync('test.json', JSON.stringify(ast, null, 2))

    return code
  }

  static parseController(ast?: (Statement | DeclarationStatement) | null) {
    const processed: string[] = []
    if (ast === undefined || ast === null) return processed

    if (Array.isArray((ast as BlockStatementBase)?.body)) {
      for (const node of (ast as BlockStatementBase).body) {
        processed.push(this.parseStatement(node) as string)
      }
    }

    return processed
  }

  static parseStatement = (node: Statement) => {
    const Declarations: Record<string, () => string | string[] | number> = {
      BlockStatement: () => { return this.parseBlockStatement(node as BlockStatement) },
      BreakStatement: () => this.parseBreakStatement(node as BreakStatement),
      ContinueStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      DebuggerStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportDefaultDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportAllDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportNamedDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      FunctionDeclaration: () => new ParseFunction(node as FunctionDeclaration).parse(),
      EmptyStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExpressionStatement: () => { return this.parseExpressionStatement(node as ExpressionStatement) },
      IfStatement: () => new ParseIFs(node as IfStatement).parseIfStatement(),
      DoWhileStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ForInStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ForOfStatement: () => this.parseForOfStatement(node as ForOfStatement),
      ForStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      WhileStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ImportDeclaration: () => { return this.parseImportDeclaration(node as ImportDeclaration) },
      LabeledStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ReturnStatement: () => { return this.parseReturnStatement(node as ReturnStatement) },
      SwitchStatement: () => new ParserSwitch(node as SwitchStatement).parse(),
      ThrowStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      TryStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      VariableDeclaration: () => { return this.parseVariableDeclaration(node as VariableDeclaration) },
      WithStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
    }
    console.log(c.hex('#008ac3')('Building:'), c.hex('#00c9a7')(node.type))
    const func = Declarations[node.type]

    if (func === undefined) {
      return this.parseExpression(node as  Expression | PrivateIdentifier | Parameter)
    }

    const result = func()

    if (this.options.debug) return Array.isArray(result) ? result.push('# ' + node.type) : `${result} # ${node.type}\n`
    return result
  }

  /**
   * Formata valores Primarios que são usados em parseStatement e seus derivados
   *
   * @template T
   * @param {Expression} expression
   * @returns {(T | undefined)}
   */
  static parseExpression(expression: Expression | PrivateIdentifier | Parameter | null): string | string[] | number {
    if (expression === null || expression === undefined) return ''

    const Expressions: Record<Expression['type'] | PrivateIdentifier['type'] | Parameter['type'], () => string | string[] | number> = {
      ArrowFunctionExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AssignmentExpression: () => { throw new Error('Chamada errada') },
      BinaryExpression: () => { return this.parseBinaryExpression(expression as BinaryExpression) },
      ConditionalExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      MetaProperty: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ChainExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXClosingElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXClosingFragment: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXExpressionContainer: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      PrivateIdentifier: () => { return this.parsePrivateIdentifier(expression as PrivateIdentifier) },
      JSXOpeningElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXOpeningFragment: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXSpreadChild: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      LogicalExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      NewExpression: () => { throw new Error('Chamada errada' )},
      RestElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      SequenceExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      SpreadElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AwaitExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      CallExpression: () => { return this.parseCallExpression(expression as CallExpression) },
      ImportExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ClassExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ClassDeclaration: () => new ParserClass(expression as ClassDeclaration).parseClassDeclaration(),
      FunctionExpression: () => this.parseFunctionExpression(expression as FunctionExpression),
      Literal: () => { return this.parseLiteral(expression as Literal) },
      TemplateLiteral: () => this.parseTemplateLiteral(expression as TemplateLiteral),
      MemberExpression: () => this.parseMemberExpression(expression as MemberExpression),
      ArrayExpression: () => this.parseArrayExpression(expression as ArrayExpression),
      ArrayPattern: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      Identifier: () => { return this.parseIdentifier(expression as Identifier) },
      Import: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXFragment: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ObjectExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ObjectPattern: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      Super: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ThisExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      TaggedTemplateExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      UnaryExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      UpdateExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      YieldExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AssignmentPattern: function (): string | string[] { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
    }
    
    const result = Expressions[expression.type]()
    console.log(c.hex('#008ac3')('Formatting:'), c.hex('#00c9a7')(expression.type, c.grey('// ', result)))
    return result
  }

  /**
   * Retorna o operador equivalente do javascript para o shell script
   *
   * @param {string} value
   * @returns {string}
   */
  static parseOperator(value: string): string {
    return (value === '===' || value === '==')
      ? '=='
      : ['!==', '!='].includes(value)
        ? '!='
        // : value
        : value === '>'
          ? '-gt'
          : value === '>='
            ? '-ge'
            : value === '<'
              ? '-lt'
              : value === '<='
                ? '-le'
                : value
  }

  /**
   * Formata retornos de strings para diversos tipo de uso (if, echo)
   *
   * @param {Expression['type']} type
   * @param {(string | string[])} content
   * @returns {string}
   */
  static parseReturnString(type: Expression['type'] | PrivateIdentifier['type'], content: string | string[]): string {
    switch (type) {
    // Identifier são constantes: const num = 0
    case 'Identifier': return `"$${content}"`
      // Literal são strings ou numbers
    case 'Literal': return !Number.isNaN(Number(content)) ? `${content}` : `"${content}"`
    case 'CallExpression': return `$(${content})`
    case 'ArrayExpression': return `(${(content as string[]).join(' ')})`
    }

    console.log(c.red('[parseReturnString] Not identified: ', type, content))
    return `"${content}"`
  }

  /**
   * Formata Comparações com Operações (==, >=, <=, <, >), usados em if & elif
   *
   * @param {BinaryExpression} node
   * @returns {string}
   */
  static parseBinaryExpression(node: BinaryExpression): string {
    const left = this.parseExpression(node.left) as string
    const right = this.parseExpression(node.right) as string
    const operator = this.parseOperator(node.operator)

    const result = `${this.parseReturnString(node.left.type, left)} ${operator} ${this.parseReturnString(node.right.type, right)}`

    // Possivel erro, isso relamente é um tapa buraco
    if (operator === '+') {
      return `$(( ${result} ))`
    }

    return `[[ ${result} ]]`
  }

  /**
   * Formata chamadas de funções junto com suas args
   * 
   * Input: function(arg) {}
   * Output: function ${arg}
   *
   * @param {CallExpression} expression
   * @returns {string}
   */
  static parseCallExpression(expression: CallExpression): string {
    if (expression?.callee.type === 'MemberExpression') {
      const callee = expression.callee as MemberExpression
      const args = expression.arguments as (Expression | SpreadElement)[]

      return this.parseMemberExpression(callee, args.map((arg) => this.parseReturnString(arg.type, this.parseExpression(arg) as string)).join(' '))
    } else {
      const functionName = expression.callee.name
      const args = expression.arguments.map((arg) => this.parseReturnString(arg.type, this.parseExpression(arg) as string)) as (string)[]

      return `${functionName} ${args.length > 0 ? args.join(' ') : ''}`
    }
  }

  /**
   * Retorna o literal das constantes
   *
   * @param {Literal} expression
   * @returns {string}
   */
  static parseLiteral(expression: Literal): string {
    return expression.value as string
  }

  /**
   * Retorna o identificador das constantes
   *
   * @param {Identifier} expression
   * @returns {string}
   */
  static parseIdentifier(expression: Identifier): string {
    return expression.name as string
  }

  static parseFunctionExpression (expression: FunctionExpression) {
    return this.parseStatement(expression.body as BlockStatement)
  }


  /**
   * Usado em parseMetaProperty, constante endPropertyName pode ser um PrivateIdentifier
   *
   * @param {PrivateIdentifier} expression
   * @returns {string}
   */
  static parsePrivateIdentifier(expression: PrivateIdentifier): string {
    return expression.name
  }

  static parseBlockStatement(node: BlockStatement) {
    const code: (string | number)[] = []

    for (const statement of node.body) {
      const result = this.parseStatement(statement)
      if (Array.isArray(result)) { code.push(...result); continue }
      code.push(result)
    }

    return breakLines(code)
  }

  static parseExpressionStatement(node: ExpressionStatement) {
    const code: string[] = []
    const expression = node.expression

    // Isso irá para CallExpression
    code.push(this.parseExpression(expression) as string)
    return breakLines(code)
  }

  /**
   * Formata os imports de arquivo, ainda em experimento, e não deve se usar para arquivos externos, apenas arquivos previamente processados por essa biblioteca!
   *
   * @param {ImportDeclaration} node
   * @returns {string}
   */
  static parseImportDeclaration(node: ImportDeclaration): string {
    const module = (node as ImportDeclaration)
    const path = dirname(resolve(this.options.path))
    // Pega o caminho relativo dos transformadores, com base no path do arquivo
    const filePath = join(path, (this.parseExpression(module.source) as string).replace('javascript', 'shellscript').replace('.js', '.sh'))
    const code = readFileSync(filePath, { encoding: 'utf-8' })

    return code
  }

  /**
   * Caso usado em functions isso ira formatar o return da função
   * 
   * Input:
   * const number = 0
   * 
   * function test() {
   *    return number
   * }
   * 
   * Output:
   * number="0"
   * 
   * teste() {
   *  echo $(( "number" ))
   * }
   *
   * @param {ReturnStatement} node
   * @returns {string}
   */
  static parseReturnStatement(node: ReturnStatement): string {
    const element = this.parseExpression(node.argument) as string

    return `echo ${this.parseReturnString(node.argument?.type ?? 'Literal', element)}`
  }


  /**
   * Formata Declarações
   *
   * @param {VariableDeclaration} node
   * @returns {string}
   */
  static parseVariableDeclaration(node: VariableDeclaration): string {
    const code: string[] = []
    for (const variable of node.declarations) {
      const variableName = this.parseExpression(variable.id) as string
      const intNode = this.parseExpression(variable.init) as string
      const variableOutput = this.parseReturnString(variable.init?.type ?? 'Literal', intNode)

      if (intNode.length === 0) { code.push(variableName); continue }

      // Veja parseNewExpression
      if (variableOutput.includes('(ARG)')) {
        const className = this.parseExpression((variable.init as NewExpression).callee)
        code.push(`\n${variableName}="${className}_${crypto.randomUUID().replaceAll('-', '')}"`)
        code.push((intNode as string).replaceAll('(ARG)', `$${variableName}`) + '\n')
        continue
      }

      code.push(`${variableName}=${variableOutput}`)
    }
    return breakLines(code)
  }

  /**
   * Trata expressões, como: console.log
   *
   * Usado em: parseCallExpression
   * @param {MemberExpression} expression
   * @returns {string}
   */
  static parseMemberExpression(expression: MemberExpression, arg?: string): string {
    const code: string[] = []

    if (expression.object.type === 'MetaProperty') {
      return this.parseMetaProperty(expression.object, expression.property)
    }

    const object = (expression.object as Identifier).name
    const property = (expression.property as Identifier).name

    if (object === undefined) return this.parseReturnString(expression.property.type, property)

    switch (object) {
    case 'console': {
      code.push(new Console({ methodName: property, variable: arg }).parse())
      break
    }
    default: {
      console.log(c.red(`[parseMemberExpression] Not identified: ${object}.${property}`))
      code.push(`${object}.${property}`)
    }
    }

    return breakLines(code)
  }

  /**
   * Usado em parseMemberExpression
   *
   * @param {MetaProperty} expression
   * @param {(Expression | PrivateIdentifier)} prop
   * @returns {string}
   */
  static parseMetaProperty(expression: MetaProperty, prop: Expression | PrivateIdentifier): string {
    const metaName = this.parseExpression(expression.meta)
    const propertyName = this.parseExpression(expression.property)
    const endPropertyName = this.parseExpression(prop)

    switch (`${metaName}.${propertyName}.${endPropertyName}`) {
    case 'import.meta.dirname': return '$(dirname "$(realpath "$0")")'
    default: console.log(c.red(`[parseMetaProperty] Not identified: ${metaName}.${propertyName}.${endPropertyName}`))
    }
    return ''
  }

  /**
   * Formata arrays (listas)
   *
   * @param {ArrayExpression} expression
   * @returns {string}
   */
  static parseArrayExpression(expression: ArrayExpression): string[] {
    const elements = expression.elements.map((element) => this.parseExpression(element))
    return (elements as string[])
  }

  /**
   * Formata For of
   * 
   * Input:
   * const numbers = [0, 2, 4]
   * 
   * for (const number of numbers) {
   *   console.log(number)
   * }
   * 
   * Output:
   * numbers=(0 2 4)
   * 
   * for number in "${numbers[@]}"; do
   *   echo "$number"
   * done
   *
   * @param {ForOfStatement} node
   * @returns {string}
   */
  static parseForOfStatement(node: ForOfStatement): string {
    const code: string[] = []
    const left = this.parseStatement(node.left as VariableDeclaration)
    const right = this.parseExpression(node.right)
    const body = this.parseController(node.body)

    code.push(`\n${getTabs(this.tabs)}for ${left} in "$\{${right}[@]}"; do`)
    this.tabs = this.tabs + 1
    code.push(...body.map((content) => `${getTabs(this.tabs)}${content}`))
    this.tabs = this.tabs - 1
    code.push(`${getTabs(this.tabs)}done`)
    return breakLines(code)
  }

  static parseBreakStatement(node: BreakStatement) {
    return node?.label === null ? '' : this.parseExpression(node.label)
  }

  /**
   * Converte strings dinamicas que usam: ``
   *
   * @param {TemplateLiteral} expression
   * @returns {string}
   */
  static parseTemplateLiteral(expression: TemplateLiteral): string {

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
        const value = this.parseReturnString(content.type, this.parseExpression(content) as string)
        code.push(value)
      }
    }

    return code.join('')
  }
}