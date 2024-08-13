import AbstractSyntaxTree from 'abstract-syntax-tree'
import c from 'chalk'
import { readFileSync, writeFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { basename, dirname, join, resolve } from 'path'
import terminalLink from 'terminal-link'
import { ArrayExpression, BinaryExpression, BlockStatement, BlockStatementBase, BreakStatement, CallExpression, DeclarationStatement, Expression, ExpressionStatement, ForOfStatement, FunctionDeclaration, Identifier, IfStatement, ImportDeclaration, Literal, MemberExpression, MetaProperty, PrivateIdentifier, ReturnStatement, SpreadElement, Statement, SwitchStatement, VariableDeclaration } from '../../node_modules/meriyah/src/estree.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'

interface TransformOptions {
  path: string
  debug?: boolean
}

export default class Transpiler {
  private tabs: number = 0
  public script: string[] = []
  private readonly options: TransformOptions

  constructor (options: TransformOptions) {
    this.options = options

    if (options.debug) console.log(c.green('Debug Mode!'))
    console.log(c.yellow(`Compiling: ${terminalLink(basename(this.options.path), this.options.path)}`))
  }

  /**
   * Carrega o AST do javascript, gera um json com todas as informações necessarias para a conversão para shell script
   *
   * @async
   * @param {string | undefined} code
   * @returns {Promise<(Statement | DeclarationStatement)>}
   */
  async loader (code?: string): Promise<(Statement | DeclarationStatement)> {
    if (code === undefined) code = await readFile(this.options.path, { encoding: 'utf-8' })
    return new AbstractSyntaxTree(code)
  }

  parser (ast?: (Statement | DeclarationStatement) | null) {
    const processed: string[] = []
    if (ast === undefined || ast === null) return processed

    if (Array.isArray((ast as BlockStatementBase)?.body)) {
      for (const node of (ast as BlockStatementBase).body) {
        processed.push(this.parseStatement(node) as string)
      }
    }

    writeFileSync('test.json', JSON.stringify(ast, null, 2))
    return processed
  }

  parseStatement = (node: Statement) => {
    const Declarations: Record<string, () => string | string[]> = {
      BlockStatement: () => { return this.parseBlockStatement(node as BlockStatement) },
      BreakStatement: () => this.parseBreakStatement(node as BreakStatement),
      ContinueStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      DebuggerStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportDefaultDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportAllDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportNamedDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      FunctionDeclaration: () => { return this.parseFunctionDeclaration(node as FunctionDeclaration) },
      EmptyStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExpressionStatement: () => { return this.parseExpressionStatement(node as ExpressionStatement) },
      IfStatement: () => { return this.parseIfStatement(node as IfStatement) },
      DoWhileStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ForInStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ForOfStatement: () => this.parseForOfStatement(node as ForOfStatement),
      ForStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      WhileStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ImportDeclaration: () => { return this.parseImportDeclaration(node as ImportDeclaration) },
      LabeledStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ReturnStatement: () => { return this.parseReturnStatement(node as ReturnStatement) },
      SwitchStatement: () => { return this.parseSwitchStatement(node as SwitchStatement) },
      ThrowStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      TryStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      VariableDeclaration: () => { return this.parseVariableDeclaration(node as VariableDeclaration) },
      WithStatement: () => { console.log(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
    }
    console.log(c.blue(`Building: ${node.type}`))
    const result = Declarations[node.type]()

    if (this.options.debug) return Array.isArray(result) ? result.push('# ' + node.type) : `${result} # ${node.type}\n`
    return result
    // console.log(`Output: ${result}`)
    // return result
  }

  /**
   * Formata valores Primarios que são usados no parse principal
   *
   * @template T
   * @param {Expression} expression
   * @returns {(T | undefined)}
   */
  parseExpression(expression: Expression | PrivateIdentifier | null): string | string[] {
    if (expression === null || expression === undefined) return ''

    const Expressions: Record<string, () => string | string[]> = {
      ArrowFunctionExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AssignmentExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      BinaryExpression: () => { return this.parseBinaryExpression(expression as BinaryExpression) },
      ConditionalExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      MetaProperty: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ChainExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXClosingElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXClosingFragment: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXExpressionContainer: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      PrivateIdentifier: () => { return this.parsePrivateIdentifier(expression as PrivateIdentifier)  },
      JSXOpeningElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXOpeningFragment: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXSpreadChild: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      LogicalExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      NewExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      RestElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      SequenceExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      SpreadElement: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AwaitExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      CallExpression: () => { return this.parseCallExpression(expression as CallExpression) },
      ImportExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ClassExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ClassDeclaration: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      FunctionExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      Literal: () => { return this.parseLiteral(expression as Literal)},
      TemplateLiteral: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      MemberExpression: () => { return this.parseMemberExpression(expression as MemberExpression, []) },
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
      YieldExpression: () => { console.log(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' }
    }

    const result = Expressions[expression.type]()
    return result
  }

  /**
   * Retorna o operador equivalente do javascript para o shell script
   *
   * @param {string} value
   * @returns {string}
   */
  parseOperator (value: string): string {
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

  parseReturnString (type: Expression['type'], content: string | string[]) {
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
   * Formata todos os If para sheçç script
   *
   * @param {IfStatement} expression
   */
  parseIfStatement (expression: IfStatement) {
    this.tabs = this.tabs + 1

    const test = this.parseExpression(expression.test)
    const consequent = this.parser(expression.consequent)
    const alternate = expression.alternate ? this.parseElseStatement(expression.alternate) : ''
    const code: string[] = []
  
    code.push(`${this.tabs >= 1 ? '\n' : ''}if ${test}; then`)
    code.push(`${breakLines(consequent.map(content => `${getTabs(this.tabs)}${content}`).filter((content) => content.length === 0 ? false : true))}`)
    if (alternate.length > 0) code.push(alternate)
    code.push(`fi${this.tabs >= 1 ? '\n' : ''}`)
  
    this.tabs = this.tabs - 1
    return breakLines(code)
  }

  /**
   * Usado para pegar recursivamente todos os else do javascript
   * @param node 
   * @returns 
   */
  parseElseStatement (node: Statement) {
    if (node.type !== 'IfStatement') return ''
    const content: string[] = []
    content.push(`elif [[ ${this.parseExpression(node.test)} ]]; then`)
    content.push(`${getTabs(this.tabs)}${this.parser(node.consequent)}`)

    if (node.alternate) content.push(this.parseElseStatement(node.alternate))
    return breakLines(content)
  }

  /**
   * Formata Comparações com Operações (==, >=, <=, <, >), usados em if & elif
   *
   * @param {BinaryExpression} node
   * @returns {string}
   */
  parseBinaryExpression(node: BinaryExpression): string {
    const left = this.parseExpression(node.left)
    const right = this.parseExpression(node.right)
    const operator = this.parseOperator(node.operator)

    return `[[ ${this.parseReturnString(node.left.type, left)} ${operator} ${this.parseReturnString(node.right.type, right)} ]]`
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
  parseCallExpression (expression: CallExpression): string {
    if (expression?.callee.type === 'MemberExpression') {
      const callee = expression.callee as MemberExpression
      const args = expression.arguments as (Expression | SpreadElement)[]
      return this.parseMemberExpression(callee, args)
    } else {
      const functionName = expression.callee.name
      const args = expression.arguments.map((arg) => this.parseReturnString(arg.type ,this.parseExpression(arg))) as (string)[]
  
      return `${functionName} ${args.length > 0 ? args.join(' ') : ''}`
    }
  }

  /**
   * Retorna o literal das constantes
   *
   * @param {Literal} expression
   * @returns {string}
   */
  parseLiteral (expression: Literal): string {
    return expression.value as string
  }

  /**
   * Retorna o identificador das constantes
   *
   * @param {Identifier} expression
   * @returns {string}
   */
  parseIdentifier (expression: Identifier): string {
    return expression.name as string
  }

  
  /**
   * Usado em parseMetaProperty, constante endPropertyName pode ser um PrivateIdentifier
   *
   * @param {PrivateIdentifier} expression
   * @returns {string}
   */
  parsePrivateIdentifier (expression: PrivateIdentifier): string {
    return expression.name
  }

  parseBlockStatement (node: BlockStatement) {
    const code: string[] = []

    for (const statement of node.body) {
      code.push(...this.parser(statement))
    }

    return breakLines(code)
  }

  parseFunctionDeclaration (node: FunctionDeclaration) {
    const code: string[] = []
    const module = (node as FunctionDeclaration)
    const functionName = module.id?.name
    const params = (module.params as Identifier[]).map(param => param.name) as string[]

    code.push(`${getTabs(this.tabs)}${functionName}() {`)

    this.tabs = this.tabs + 1
    for (const [index, param] of Object.entries(params)) {
      code.push(`${getTabs(this.tabs)}local ${param}=$${Number(index) + 1}`)
    }

    code.push(...this.parser(node.body).map(output => `${getTabs(this.tabs)}${output}`))
    this.tabs = 0
    code.push(getTabs(this.tabs) + '}\n')

    return breakLines(code)
  }

  parseExpressionStatement (node: ExpressionStatement) {
    const code: string[] = []
    const expression = node.expression
    if (expression === undefined) return ''

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
  parseImportDeclaration (node: ImportDeclaration): string {
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
  parseReturnStatement (node: ReturnStatement): string {
    const element = this.parseExpression((node as ReturnStatement).argument)

    return `echo ${this.parseReturnString(node.argument?.type ?? 'Literal', element)}`
  }
  
  /**
   * Formata switchs
   *
   * @param {SwitchStatement} node
   * @returns {string}
   */
  parseSwitchStatement (node: SwitchStatement): string {
    const code: string[] = []
    const module = (node as SwitchStatement)
    const discriminant = this.parseExpression(module.discriminant)

    code.push(`${getTabs(this.tabs)}case $${discriminant} in`)
    this.tabs = this.tabs + 1
    for (const caseNode of module.cases) {
      this.tabs = this.tabs + 1
      if (caseNode.test) {
        const testValue = this.parseExpression(caseNode.test)
        code.push(`${getTabs(this.tabs)}"${testValue}")`)
      } else {
        code.push(getTabs(this.tabs) + '*))')
      }

      this.tabs = this.tabs + 1

      code.push(getTabs(this.tabs) + breakLines(this.parser(...caseNode.consequent)))
      code.push(getTabs(this.tabs) + ';;')

      this.tabs = this.tabs - 1
      this.tabs = this.tabs - 1
    }
    code.push(getTabs(this.tabs) + 'esac')
    this.tabs = this.tabs - 1
    return breakLines(code)
  }
  
  /**
   * Formata Declarações
   *
   * @param {VariableDeclaration} node
   * @returns {string}
   */
  parseVariableDeclaration (node: VariableDeclaration): string {
    const code: string[] = []
    for (const variable of node.declarations) {
      const variableName = this.parseExpression(variable.id) as string
      const intNode = this.parseExpression(variable.init)
      const variableOutput = this.parseReturnString(variable.init?.type ?? 'Literal', intNode)

      if (intNode.length === 0) { code.push(variableName); continue }
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
  parseMemberExpression (expression: MemberExpression, args: (Expression | SpreadElement)[]): string {
    const code: string[] = []

    if (expression.object.type === 'MetaProperty') {
      return this.parseMetaProperty(expression.object, expression.property)
    }

    const object = (expression.object as Identifier).name
    const property = (expression.property as Identifier).name

    switch (`${object}.${property}`) {
    case 'console.log': {
      for (const argument of args) {
        const string = this.parseExpression(argument)
        const result = this.parseReturnString(argument.type, string)
        code.push(`echo ${result}`)
      }
      break
    }
    default: {
      console.log(c.red(`[parseMemberExpression] Not identified: ${object}.${property}`))
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
  parseMetaProperty (expression: MetaProperty, prop: Expression | PrivateIdentifier): string {
    const metaName = this.parseExpression(expression.meta)
    const propertyName = this.parseExpression(expression.property)
    const endPropertyName =  this.parseExpression(prop)

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
  parseArrayExpression (expression: ArrayExpression): string[] {
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
   * @param {ForOfStatement} node
   * @returns {string}
   */
  parseForOfStatement (node: ForOfStatement): string {
    const code: string[] = []
    const left = this.parseStatement(node.left as VariableDeclaration)
    const right = this.parseExpression(node.right)
    const body = this.parser(node.body)
    
    code.push(`\n${getTabs(this.tabs)}for ${left} in "$\{${right}[@]}"; do`)
    this.tabs = this.tabs + 1
    code.push(...body.map((content) => `${getTabs(this.tabs)}${content}`))
    this.tabs = this.tabs - 1
    code.push(`${getTabs(this.tabs)}done`)
    return breakLines(code)
  }

  parseBreakStatement (node: BreakStatement) {
    return node?.label === null ? '' : this.parseExpression(node.label)
  }
}