import AbstractSyntaxTree from 'abstract-syntax-tree'
import { writeFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { _Node, SwitchStatement, BinaryExpression, CallExpression, Expression, ExpressionStatement, FunctionDeclaration, Identifier, IfStatement, Literal, MemberExpression, Statement } from '../../node_modules/meriyah/src/estree'
import { getTabs } from '../libs/getTabs'

interface AST extends _Node {
    body: (Expression | Statement)[]
}

interface TransformOptions {
    path: string
}

export class Transform {
  private readonly path: string
  private numberIfs: number = 0
  private numberFuncts: number = 0

  constructor ({ path }: TransformOptions) {
    this.path = path
  }

  async loader (path: string): Promise<AST> {
    const code = await readFile(path, { encoding: 'utf-8' })
    return new AbstractSyntaxTree(code)
  }

  parser (ast: AST) {
    const script: string[] = []
    if (ast === undefined) return script

    const process = (node: Expression | Statement) => {
      switch (node.type) {
      case 'BlockStatement': {
        for (const statement of node.body) {
          this.parser(statement)
        }
        break
      }
      case 'BreakStatement':
      case 'ContinueStatement':
      case 'DebuggerStatement':
      case 'ExportDefaultDeclaration':
      case 'ExportAllDeclaration':
      case 'ExportNamedDeclaration':
      case 'FunctionDeclaration': {
        if (node.type !== 'FunctionDeclaration') return
        this.numberFuncts = this.numberFuncts + 1

        const module = (node as FunctionDeclaration)
        const functionName = module.id?.name
        const params = module.params?.map(param => param.name) as string[]

        script.push(`${functionName}() {`)
        for (const [index, param] of Object.entries(params)) {
          script.push(`${getTabs(this.numberFuncts)}local ${param}=$${Number(index) + 1}`)
        }
        script.push(...this.parser(node.body).map(output => `${getTabs(this.numberFuncts)}${output}`))
        this.numberFuncts = 0
        script.push(getTabs(this.numberFuncts) + '}\n')
        break
      }
      case 'EmptyStatement':
      case 'ExpressionStatement': {
        const expression = (node as ExpressionStatement).expression as CallExpression
        if (expression === undefined) return script

        switch (expression.type) {
        case 'CallExpression': {
          const callee = (expression as CallExpression).callee
          switch (callee.type) {
          case 'MemberExpression': {
            const object = ((callee as MemberExpression).object as Identifier).name
            const property = ((callee as MemberExpression).property as Identifier).name
        
            switch (`${object}.${property}`) {
            case 'console.log': {
              for (const argument of expression.arguments) {
                switch (argument.type) {
                case 'Literal': {
                  script.push(`echo "${argument.value}"`)
                  break
                }
                case 'Identifier': {
                  script.push(`echo "$\{${argument.name}}"`)
                }
                }
              }
              break
            }
            }
          }
          }
                        
        }
        }
        break
      }
      case 'IfStatement': {
        this.numberIfs = this.numberIfs + 1
        script.push(`\nif [[ ${this.parseExpression(node.test)} ]]; then`)
        script.push(...(this.parser(node.consequent)).map((text) => `${getTabs(this.numberIfs)}${text}`))
        script.push('fi\n')
        this.numberIfs = 0
        break
      }
      case 'DoWhileStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'ForStatement':
      case 'WhileStatement':
      case 'ImportDeclaration':
      case 'LabeledStatement':
      case 'ReturnStatement': {
        script.push(`echo $(( ${this.parseExpression(node.argument)} ))`)
        break
      }
      case 'SwitchStatement': {
        const module = (node as SwitchStatement)
        const discriminant = this.parseExpression<string>(module.discriminant)
        script.push(`case $${discriminant} in`)

        for (const caseNode of module.cases) {
          if (caseNode.test) {
            const testValue = this.parseExpression(caseNode.test)
            script.push(`  "${testValue}")\n`)
          } else {
            script.push('  *)\n)')
          }
          script.push('    ' + this.parser(...caseNode.consequent).join('\n') + '\n')
          script.push('    ;;')
        }
        script.push('esac\n')

        break
      }
      case 'ThrowStatement':
      case 'TryStatement':
      case 'VariableDeclaration': {
        if (node.type !== 'VariableDeclaration') break
        for (const variable of node.declarations) {
          const variableName = this.parseExpression<string>(variable.id)
          const intNode = this.parseExpression(variable.init)
          

          script.push(`${variableName}=${variable.init?.type === 'Literal' ? `"${intNode}"` : intNode}`)
          
        }
        break
      }
      case 'WithStatement':
      }
    }

    writeFileSync('test.sh', script.join('\n'))
    if (Array.isArray(ast?.body)) {
      for (const node of ast.body) {
        process(node)
        writeFileSync('test.json', JSON.stringify(ast, null, 2))
      }
    }
    writeFileSync('test.sh', script.join('\n'))
    return script
  }

  parseExpression<T>(expression: Expression): T | undefined {
    switch (expression.type) {
    case 'ArrowFunctionExpression':
    case 'AssignmentExpression':
    case 'BinaryExpression': {
      const module = (expression as BinaryExpression)
      const left = this.parseExpression<string>(module.left)
      const right = this.parseExpression<string>(module.right)
      const operator = this.parseOperator(module.operator)

      return `"$\{${left}}" ${operator} "$\{${right}}"` as T
    }
    case 'ConditionalExpression':
    case 'MetaProperty':
    case 'ChainExpression':
    case 'JSXClosingElement':
    case 'JSXClosingFragment':
    case 'JSXExpressionContainer':
    case 'JSXOpeningElement':
    case 'JSXOpeningFragment':
    case 'JSXSpreadChild':
    case 'LogicalExpression':
    case 'NewExpression':
    case 'RestElement':
    case 'SequenceExpression':
    case 'SpreadElement':
    case 'AwaitExpression':
    case 'CallExpression': {
      const module = (expression as CallExpression)
      const functionName = module.callee.name
      const args = module.arguments.map((arg) => this.parseExpression(arg)).join(' ')

      return `$( ${functionName} ${args} )` as T
    }
    case 'ImportExpression':
    case 'ClassExpression':
    case 'ClassDeclaration':
    case 'FunctionExpression':
    case 'Literal': {
      return (expression as Literal).value as T
    }
    case 'TemplateLiteral':
    case 'MemberExpression':
    case 'ArrayExpression':
    case 'ArrayPattern':
    case 'Identifier': {
      return (expression as Identifier).name as T
    }
    case 'Import':
    case 'JSXElement':
    case 'JSXFragment':
    case 'ObjectExpression':
    case 'ObjectPattern':
    case 'Super':
    case 'ThisExpression':
    case 'TaggedTemplateExpression':
    case 'UnaryExpression':
    case 'UpdateExpression':
    case 'YieldExpression':
    }
  }

  parseOperator (value: string) {
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
}