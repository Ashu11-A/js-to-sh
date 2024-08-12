import AbstractSyntaxTree from 'abstract-syntax-tree'
import { writeFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { BinaryExpression, SpreadElement, BlockStatement, VariableDeclaration, BlockStatementBase, ImportDeclaration, ReturnStatement, CallExpression, DeclarationStatement, IfStatement, Expression, ExpressionStatement, FunctionDeclaration, Identifier, Literal, MemberExpression, Statement, SwitchStatement } from '../../node_modules/meriyah/src/estree.js'
import { breakLines } from '../libs/breakLines.js'
import { getTabs } from '../libs/getTabs.js'
import { join } from 'path'

export class Transform {
  private numberIfs: number = 0
  private numberFuncts: number = 0
  public script: string[] = []

  /**
   * Carrega o AST do javascript, gera um json com todas as informações necessarias para a conversão para shell script
   *
   * @async
   * @param {string} path
   * @returns {Promise<(Statement | DeclarationStatement)>}
   */
  async loader (path: string): Promise<(Statement | DeclarationStatement)> {
    const code = await readFile(path, { encoding: 'utf-8' })
    return new AbstractSyntaxTree(code)
  }

  parser (ast?: (Statement | DeclarationStatement) | null) {
    const processed: string[] = []
    if (ast === undefined || ast === null) return processed

    const process = (node: Statement) => {
      const Declarations: Record<string, () => string> = {
        BlockStatement: () => { return this.parseBlockStatement(node as BlockStatement) },
        BreakStatement: () => { return '' },
        ContinueStatement: () => { return '' },
        DebuggerStatement: () => { return '' },
        ExportDefaultDeclaration: () => { return '' },
        ExportAllDeclaration: () => { return '' },
        ExportNamedDeclaration: () => { return '' },
        FunctionDeclaration: () => { return this.parseFunctionDeclaration(node as FunctionDeclaration) },
        EmptyStatement: () => { return '' },
        ExpressionStatement: () => { return this.parseExpressionStatement(node as ExpressionStatement) },
        IfStatement: () => { return this.parseIfStatement(node as IfStatement) },
        DoWhileStatement: () => { return '' },
        ForInStatement: () => { return '' },
        ForOfStatement: () => { return '' },
        ForStatement: () => { return '' },
        WhileStatement: () => { return '' },
        ImportDeclaration: () => { return this.parseImportDeclaration(node as ImportDeclaration) },
        LabeledStatement: () => { return '' },
        ReturnStatement: () => { return this.parseReturnStatement(node as ReturnStatement) },
        SwitchStatement: () => { return this.parseSwitchStatement(node as SwitchStatement) },
        ThrowStatement: () => { return '' },
        TryStatement: () => { return '' },
        VariableDeclaration: () => { return this.parseVariableDeclaration(node as VariableDeclaration) },
        WithStatement: () => { return '' },
      }
      console.log(`Building: ${node.type}`)
      const result = Declarations[node.type]()
      console.log(`Output: ${result}`)
      return result
    }

    if (Array.isArray((ast as BlockStatementBase)?.body)) {
      for (const node of (ast as BlockStatementBase).body) {
        processed.push(process(node))
      }
    }

    writeFileSync('test.json', JSON.stringify(processed, null, 2))
    writeFileSync('test.sh', breakLines(processed))
    return processed
  }

  /**
   * Formata valores Primarios que são usados no parse principal
   *
   * @template T
   * @param {Expression} expression
   * @returns {(T | undefined)}
   */
  parseExpression(expression: Expression | null): string {
    if (expression === null || expression === undefined) return ''

    const Expressions: Record<string, () => string> = {
      ArrowFunctionExpression: () => { return '' },
      AssignmentExpression: () => { return '' },
      BinaryExpression: () => { return this.parseBinaryExpression(expression as BinaryExpression) },
      ConditionalExpression: () => { return '' },
      MetaProperty: () => { return '' },
      ChainExpression: () => { return '' },
      JSXClosingElement: () => { return '' },
      JSXClosingFragment: () => { return '' },
      JSXExpressionContainer: () => { return '' },
      JSXOpeningElement: () => { return '' },
      JSXOpeningFragment: () => { return '' },
      JSXSpreadChild: () => { return '' },
      LogicalExpression: () => { return '' },
      NewExpression: () => { return '' },
      RestElement: () => { return '' },
      SequenceExpression: () => { return '' },
      SpreadElement: () => { return '' },
      AwaitExpression: () => { return '' },
      CallExpression: () => { return this.parseCallExpression(expression as CallExpression) },
      ImportExpression: () => { return '' },
      ClassExpression: () => { return '' },
      ClassDeclaration: () => { return '' },
      FunctionExpression: () => { return '' },
      Literal: () => { return this.parseLiteral(expression as Literal)},
      TemplateLiteral: () => { return '' },
      MemberExpression: () => { return this.parseMemberExpression(expression as MemberExpression, []) },
      ArrayExpression: () => { return '' },
      ArrayPattern: () => { return '' },
      Identifier: () => { return this.parseIdentifier(expression as Identifier) },
      Import: () => { return '' },
      JSXElement: () => { return '' },
      JSXFragment: () => { return '' },
      ObjectExpression: () => { return '' },
      ObjectPattern: () => { return '' },
      Super: () => { return '' },
      ThisExpression: () => { return '' },
      TaggedTemplateExpression: () => { return '' },
      UnaryExpression: () => { return '' },
      UpdateExpression: () => { return '' },
      YieldExpression: () => { return '' }
    }

    const expressionFunction = Expressions[expression.type]
    return expressionFunction()
  }

  /**
   * Retorna o operador equivalente do javascript para o shell script
   *
   * @param {string} value
   * @returns {string}
   */
  parseOperator (value: string): string {
    return (value === '===' || value === '==')
      ? '='
      : ['!==', '!='].includes(value)
        ? '!='
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
   * Formata todos os If para sheçç script
   *
   * @param {IfStatement} expression
   */
  parseIfStatement (expression: IfStatement) {
    this.numberIfs = this.numberIfs + 1
    const test = this.parseExpression(expression.test)
    const consequent = this.parser(expression.consequent)
    const alternate = expression.alternate ? this.parseElseStatement(expression.alternate) : ''
    const code: string[] = []
  
    code.push(`${this.numberIfs === 1 ? '\n' : ''}if ${test}; then`)
    code.push(`${breakLines(consequent.map(content => `${getTabs(this.numberIfs)}${content}`).filter((content) => content.length === 0 ? false : true))}`)
    if (alternate.length > 0) code.push(alternate)
    code.push(`fi${this.numberIfs === 1 ? '\n' : ''}`)
  
    this.numberIfs = 1
    return code.join('\n')
  }

  /**
   * Usado para pegar recursivamente todos os else do javascript
   * @param node 
   * @returns 
   */
  parseElseStatement (node: Statement) {
    if (node.type !== 'IfStatement') return ''
    const content: string[] = []
    content.push(`elif [ ${this.parseExpression(node.test)} ]; then`)
    content.push(`${getTabs(this.numberIfs)}${this.parser(node.consequent)}`)

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

    return `[[ "$\{${left}}" ${operator} "$\{${right}} ]]"`
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
      const args = expression.arguments.map((arg) => this.parseExpression(arg)).join(' ')
  
      return `${functionName} ${args.length > 0 ? `$\{${args}}` : ''}`
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

  parseBlockStatement (node: BlockStatement) {
    const code: string[] = []

    for (const statement of node.body) {
      code.push(...this.parser(statement))
    }

    return code.join('\n')
  }

  parseFunctionDeclaration (node: FunctionDeclaration) {
    const code: string[] = []
    this.numberFuncts = this.numberFuncts + 1

    const module = (node as FunctionDeclaration)
    const functionName = module.id?.name
    const params = (module.params as Identifier[]).map(param => param.name) as string[]

    code.push(`${functionName}() {`)
    for (const [index, param] of Object.entries(params)) {
      code.push(`${getTabs(this.numberFuncts)}local ${param}=$${Number(index) + 1}`)
    }
    code.push(...this.parser(node.body).map(output => `${getTabs(this.numberFuncts)}${output}`))
    this.numberFuncts = 0
    code.push(getTabs(this.numberFuncts) + '}\n')

    return code.join('\n')
  }

  parseExpressionStatement (node: ExpressionStatement) {
    const code: string[] = []
    const expression = node.expression
    if (expression === undefined) return ''

    // Isso irá para CallExpression
    code.push(this.parseExpression(expression))
    return code.join('\n')
  }
  
  /**
   * Formata os imports de arquivo, ainda em experimento, e não deve se usar para arquivos externos, apenas arquivos previamente processados por essa biblioteca!
   *
   * @param {ImportDeclaration} node
   * @returns {string}
   */
  parseImportDeclaration (node: ImportDeclaration): string {
    const module = (node as ImportDeclaration)
    const path = join(process.cwd(), 'src', `${(this.parseExpression(module.source) as string).replace('../../', '').replace('javascript', 'shellscript').replace('.js', '.sh')}`)

    return `source ${path}`
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

    switch (node.argument?.type) {
    // Identifier são constantes: const num = 0
    case 'Identifier': {
      return `echo $(( "${element}" ))`
    }
    // Literal são string: "Hello world"
    case 'Literal': {
      return `echo "${element}"`
    }
    }
    return `echo $(( "${element}" ))` 
  }
  
  /**
   * Formata switchs
   *
   * @param {SwitchStatement} node
   * @returns {string}
   */
  parseSwitchStatement (node: SwitchStatement) {
    const module = (node as SwitchStatement)
    const discriminant = this.parseExpression(module.discriminant)

    this.script.push(`case $${discriminant} in`)

    for (const caseNode of module.cases) {
      if (caseNode.test) {
        const testValue = this.parseExpression(caseNode.test)
        this.script.push(`  "${testValue}")\n`)
      } else {
        this.script.push('  *)\n)')
      }
      this.script.push('    ' + this.parser(...caseNode.consequent).join('\n') + '\n')
      this.script.push('    ;;')
    }
    return 'esac\n'
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
      const variableName = this.parseExpression(variable.id)
      const intNode = this.parseExpression(variable.init)
      

      code.push(`${variableName}=${variable.init?.type === 'Literal' ? `"${intNode}"` : intNode}`)
    }
    return code.join('\n')
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
    const object = (expression.object as Identifier).name
    const property = (expression.property as Identifier).name
  
    switch (`${object}.${property}`) {
    case 'console.log': {
      for (const argument of args) {
        const result = this.parseExpression(argument)
        code.push(`echo "${result}"`)
      }
      break
    }
    }
    return code.join('\n')
  }
}