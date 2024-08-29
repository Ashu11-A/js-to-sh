/* eslint-disable @typescript-eslint/ban-ts-comment */
import { breakLines } from '@/libs/breakLines.js'
import { getTabs } from '@/libs/getTabs.js'
import { Console } from '@/modules/console.js'
import { ParserClass } from '@/transpilers/class.js'
import { ParseFunction } from '@/transpilers/funtion.js'
import { ParseIFs } from '@/transpilers/ifElse.js'
import { ParserSwitch } from '@/transpilers/switch.js'
import c from 'chalk'
import { ParseFetch } from '@/modules/fetch.js'
// @ts-ignore
import AbstractSyntaxTree from 'abstract-syntax-tree'
import chalk from 'chalk'
import { existsSync, readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { ArrowFunctionExpression, AwaitExpression, ClassDeclaration, NewExpression, ObjectExpression, ObjectLiteralElementLike, Property } from 'node_modules/meriyah/dist/src/estree.js'
import { basename, dirname, join, resolve } from 'path'
import terminalLink from 'terminal-link'
import { ArrayExpression, BinaryExpression, BlockStatement, BlockStatementBase, BreakStatement, CallExpression, DeclarationStatement, Expression, ExpressionStatement, ForOfStatement, FunctionDeclaration, FunctionExpression, Identifier, IfStatement, ImportDeclaration, Literal, MemberExpression, MetaProperty, Parameter, PrivateIdentifier, ReturnStatement, SpreadElement, Statement, SwitchStatement, TemplateLiteral, VariableDeclaration } from '../../node_modules/meriyah/src/estree.js'

interface TransformOptions {
  path: string
  cwd?: string
  debug?: boolean
}

export class Transpiler {
  static tabs: number = 0
  static options: TransformOptions
  static globalDeclarations: Record<string, string> = {}

  constructor(options: TransformOptions) {
    Transpiler.options = {
      ...options,
      path: join(options.cwd ?? '', options.path)
    }

    global.console = {
      ...global.console,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debug(message?: any, ...optionalParams: any[]) {
        if (Transpiler.options.debug) process.stdout.write(`${message} ${optionalParams.join('\n')}\n`)
      },
    }

    console.debug(c.hex('#f9f871')('Debug Mode!'))
    console.debug(c.hex('#845ec2')('Compiling:'), c.hex('#ffc75f')(terminalLink(basename(Transpiler.options.path), Transpiler.options.path)))
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

    const source = this.parseController(ast)

    for (const [, codeSource] of Object.entries(Transpiler.globalDeclarations)) {
      code.push(codeSource)
    }

    Transpiler.globalDeclarations = {}
    code.push(...source)

    return breakLines(code)
  }

  static parseController(ast?: (Statement | DeclarationStatement) | null) {
    const processed: string[] = []
    if (ast === undefined || ast === null) return processed

    if (Array.isArray((ast as BlockStatementBase)?.body)) {
      for (const node of (ast as BlockStatementBase).body) {
        processed.push(this.parseStatement(node) as string)
      }
    } else {
      processed.push(this.parseStatement(ast as Statement) as string)
    }

    return processed
  }

  static parseStatement = (node: Statement) => {
    const Declarations: Record<string, () => string | string[] | number> = {
      BlockStatement: () => { return this.parseBlockStatement(node as BlockStatement) },
      BreakStatement: () => this.parseBreakStatement(node as BreakStatement),
      ContinueStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      DebuggerStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportDefaultDeclaration: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportAllDeclaration: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExportNamedDeclaration: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      FunctionDeclaration: () => new ParseFunction(node as FunctionDeclaration).parse(),
      EmptyStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ExpressionStatement: () => this.parseExpressionStatement(node as ExpressionStatement),
      IfStatement: () => new ParseIFs(node as IfStatement).parseIfStatement(),
      DoWhileStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ForInStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ForOfStatement: () => this.parseForOfStatement(node as ForOfStatement),
      ForStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      WhileStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ImportDeclaration: () => { return this.parseImportDeclaration(node as ImportDeclaration) },
      LabeledStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      ReturnStatement: () => { return this.parseReturnStatement(node as ReturnStatement) },
      SwitchStatement: () => new ParserSwitch(node as SwitchStatement).parse(),
      ThrowStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      TryStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
      VariableDeclaration: () => this.parseVariableDeclaration(node as VariableDeclaration),
      WithStatement: () => { console.debug(c.red(`[parseExpression] Not identified: ${node.type}`)); return '' },
    }
    console.debug(c.hex('#008ac3')('Building:'), c.hex('#00c9a7')(node.type))
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
      ArrowFunctionExpression: () => ParseFunction.parseArrowFunctionExpression(expression as ArrowFunctionExpression),
      AssignmentExpression: () => { throw new Error('Chamada errada') },
      BinaryExpression: () => { return this.parseBinaryExpression(expression as BinaryExpression) },
      ConditionalExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      MetaProperty: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ChainExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXClosingElement: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXClosingFragment: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXExpressionContainer: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      PrivateIdentifier: () => { return this.parsePrivateIdentifier(expression as PrivateIdentifier) },
      JSXOpeningElement: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXOpeningFragment: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXSpreadChild: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      LogicalExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      NewExpression: () => ParserClass.parseNewExpression(expression as NewExpression),
      RestElement: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      SequenceExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      SpreadElement: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AwaitExpression: () => this.parseAwaitExpression(expression as AwaitExpression),
      CallExpression: () => this.parseCallExpression(expression as CallExpression),
      ImportExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ClassExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ClassDeclaration: () => new ParserClass(expression as ClassDeclaration).parseClassDeclaration(),
      FunctionExpression: () => this.parseFunctionExpression(expression as FunctionExpression),
      Literal: () => { return this.parseLiteral(expression as Literal) },
      TemplateLiteral: () => this.parseTemplateLiteral(expression as TemplateLiteral),
      MemberExpression: () => this.parseMemberExpression(expression as MemberExpression),
      ArrayExpression: () => this.parseArrayExpression(expression as ArrayExpression),
      ArrayPattern: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      Identifier: () => { return this.parseIdentifier(expression as Identifier) },
      Import: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXElement: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      JSXFragment: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ObjectExpression: () => this.parseObjectExpression(expression as ObjectExpression),
      ObjectPattern: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      Super: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      ThisExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      TaggedTemplateExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      UnaryExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      UpdateExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      YieldExpression: () => { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
      AssignmentPattern: function (): string | string[] { console.debug(c.red(`[parseExpression] Not identified: ${expression.type}`)); return '' },
    }
    const func = Expressions[expression.type]

    if (func === undefined) {
      return this.parseStatement(expression as Statement)
    }
    
    const result = func()
    console.debug(c.hex('#008ac3')('Formatting:'), c.hex('#00c9a7')(expression.type, c.grey('// ', result)))
    return result
  }

  static parseObjectLiteralElementLike (element: ObjectLiteralElementLike) {
    const LiteralElement: Record<ObjectLiteralElementLike['type'], () => string | string[]> = {
      MethodDefinition: () => '',
      Property: () => {
        const property = element as Property
        const key = this.parseExpression(property.key) as string
        const value = this.parseExpression(property.value) as string
        return [key, value, property.value.type]
      },
      RestElement: () => '',
      SpreadElement: () => ''
    }

    const result = LiteralElement[element.type]()
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
    case 'ArrowFunctionExpression': return `${content}`
    case 'ObjectExpression': return `${content}`
    }

    console.debug(c.red('[parseReturnString] Not identified: ', type, content))
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
      const rootPath = join(import.meta.dirname, '..')

      /**
       * Aqui é definido o transformers de certas funções, como o fetch, onde é puxado a função que trata o fetch entre curl e wget, e o isCommand para validar se existe as dependencias
       */
      switch (functionName) {
      case 'fetchShell': {
        const fetchCode = readFileSync(join(rootPath, 'transformers/shellscript/fetch.sh'), { encoding: 'utf-8' })
        const isCommandCode = readFileSync(join(rootPath, 'transformers/shellscript/isCommand.sh'), { encoding: 'utf-8' })
        Transpiler.globalDeclarations = Object.assign({ 'isCommand': isCommandCode, 'fetch': fetchCode }, Transpiler.globalDeclarations)
        break
      }
      }

      const args = expression.arguments.map((arg) => this.parseReturnString(arg.type, this.parseExpression(arg) as string)) as (string)[]

      const transformer = join(rootPath, 'transformers/shellscript', `${functionName}.sh`)

      if (existsSync(transformer)) {
        const transformerCode = readFileSync(transformer, { encoding: 'utf-8' })
        Transpiler.globalDeclarations = Object.assign(Transpiler.globalDeclarations, { [functionName]: transformerCode })
      }

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
    const packagee = this.parseExpression(module.source) as string
    const path = dirname(resolve(this.options.path))

    if (!existsSync(join(path, packagee))) {
      throw new Error(chalk.red(`[${packagee}] `, 'It is not possible to use external or internal packages.'))
    }
    // Pega o caminho relativo dos transformadores, com base no path do arquivo
    const filePath = join(path, packagee.replace('javascript', 'shellscript').replace('.js', '.sh'))
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

      // Caso seja um ArrowFunctionExpression, então será uma função, por isso adicione a indentação
      if (variable.init?.type === 'ArrowFunctionExpression') this.tabs++
      const intNode = this.parseExpression(variable.init) as string
      if (variable.init?.type === 'ArrowFunctionExpression') this.tabs--

      /**
       * Quando usar const data = await fetchShell()
       * o tipo dele será AwaitExpression, mas isso é só um intermediário para CallExpression, por isso usamos: variable.init.argument.type
       */
      const variableOutput = this.parseReturnString(variable.init?.type === 'AwaitExpression' ? (variable.init as AwaitExpression).argument.type : variable.init?.type ?? 'Literal', intNode)

      if (intNode.length === 0) { code.push(variableName); continue }

      // Veja parseNewExpression
      if (variableOutput.includes('(ARG)')) {
        const className = this.parseExpression((variable.init as NewExpression).callee) as string
        const parserClass = ParserClass.all.get(className) as ParserClass
        parserClass.constant = variableName

        code.push(`\n${variableName}="${className}_${crypto.randomUUID().replaceAll('-', '')}"`)
        code.push((intNode as string).replaceAll('(ARG)', `$${variableName}`) + '\n')
        continue
      }

      /**
       * Em ArrowFunctionExpression, a declaração de uma constante é irrelevante, por isso declaramos ela como se fosse
       * uma function normal
       * 
       * Input:
       * const func = () => console.log('ArrowFunctionExpression')
       * 
       * Output:
       * function func() {
       *   echo "ArrowFunctionExpression"
       * }
       */
      if (variable.init?.type === 'ArrowFunctionExpression') {
        code.push(`function ${variableName} () {`)
        code.push(variableOutput)
        code.push('}')
      } else {
        code.push(`${variableName}=${variableOutput}`)
      }
    }
    return breakLines(code)
  }

  /**
   * Trata expressões, como: console.debug
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

    /**
     * Isso serve para achar se a variable declarada é o retorno de uma class
     * Se a variavel é uma class, tipo: const pessoa = new Pessoa('Matheus', '18')
     * A palavra "pessoa" armazena os dados da class, e deve ser passada para o metodo que está sendo usado
     * Tipo: pessoa.comprimentar
     * Será: Pessoa_cumprimentar $pessoa
     * 
     * Pessoa: é o nome da class
     * cumprimentar: o nome do metodo
     * $pessoa: referece a: "const pessoa = new Pessoa('Matheus', '18')"", e armazena as informações que serão usadas no metodo "cumprimentar"
     */
    const parserClass = ParserClass.all.entries()
    let className: string | undefined
    for (const [, classs] of parserClass) {
      if (classs.constant === object) className = classs.className
    }
      
    if (className !== undefined) {
      code.push(`${className}_${property} $${object}`)
      return breakLines(code)
    }

    switch (object) {
    case 'console': {
      code.push(new Console({ methodName: property, variable: arg }).parse())
      break
    }
    default: {
      console.debug(c.red(`[parseMemberExpression] Not identified: ${object}.${property}`))
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
    default: console.debug(c.red(`[parseMetaProperty] Not identified: ${metaName}.${propertyName}.${endPropertyName}`))
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
  
  /**
   * Adiciona wait ao código para esperar o seu resultado.
   *
   * @static
   * @param {AwaitExpression} expression
   * @returns {string}
   */
  static parseAwaitExpression (expression: AwaitExpression): string {
    return this.parseExpression(expression.argument) as string
    /*  Not working
    const callee = this.parseExpression(expression.argument)
    const resultParsed = this.parseReturnString(expression.argument.type, String(callee))


    // return `$(wait ${resultParsed})`
    */
  }

  static parseObjectExpression (expression: ObjectExpression) {
    return new ParseFetch(expression).parserProperties()
  }
}