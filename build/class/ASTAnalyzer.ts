import { AST_NODE_TYPES, parse, TSError } from '@typescript-eslint/typescript-estree'
import { readFile } from 'fs/promises'
import type {
  CallExpressionArgument,
  Expression,
  ObjectLiteralElement,
  ProgramStatement,
} from '../../node_modules/@typescript-eslint/types/dist/generated/ast-spec.js'
import { TypeExtractor } from '../lib/TypeExtractor.js'

/**
 * Class responsible for analyzing TypeScript ASTs (Abstract Syntax Trees).
 */
export class ASTAnalyzer {
  /**
   * Stores the types used in the analyzed code.
   */
  private typesUsage: string[] = []

  /**
   * Keys extracted from the `TypeExtractor`.
   */
  private keys: string[]

  /**
   * Initializes the ASTAnalyzer with a `TypeExtractor` instance.
   * @param typeExtractor - The instance of `TypeExtractor` used to extract types.
   */
  constructor(private typeExtractor: TypeExtractor) {
    const types = this.typeExtractor.extract()
    this.keys = Object.keys(types)
  }

  /**
   * Analyzes a TypeScript file and extracts type usage.
   * @param path - The file path to analyze.
   * @returns A promise that resolves to an array of used types.
   */
  public async analyzeFile(path: string): Promise<string[]> {
    const code = await readFile(path, 'utf8')

    try {
      const ast = parse(code, {
        loc: true,
        range: true,
        comment: true,
        tokens: true,
      })
      ast.body.forEach((node) => this.analyzeAST(node))
  
      return this.typesUsage
    } catch (error) {
      if (error instanceof TSError) throw new Error(`The file analyzed by the AST is faulty: ${error.message}`)
      throw new Error('The file cannot be analyzed')
    }

  }

  /**
   * Analyzes a program statement node from the AST.
   * @param node - The program statement node to analyze.
   */
  private analyzeAST(node: ProgramStatement): void {
    if (node.type === AST_NODE_TYPES.ExpressionStatement) {
      this.analyzeExpression(node.expression)
    }
  }

  /**
   * Analyzes an expression node from the AST.
   * @param expression - The expression node to analyze.
   */
  private analyzeExpression(expression: Expression): void {
    if (expression.type === AST_NODE_TYPES.NewExpression) {
      expression.arguments.forEach((arg) => this.analyzeArgument(arg))
    }
  }

  /**
   * Analyzes an argument node from a call expression.
   * @param arg - The argument node to analyze.
   */
  private analyzeArgument(arg: CallExpressionArgument): void {
    if (arg.type === AST_NODE_TYPES.ObjectExpression) {
      arg.properties.forEach((prop) => this.analyzeProperty(prop))
    }
  }

  /**
   * Analyzes a property node from an object literal.
   * @param prop - The property node to analyze.
   */
  private analyzeProperty(prop: ObjectLiteralElement): void {
    if (
      prop.type === AST_NODE_TYPES.Property &&
      prop.value.type === AST_NODE_TYPES.Literal
    ) {
      const value = prop.value.value

      if (typeof value === 'string' && this.keys.includes(value)) {
        this.typesUsage.push(value)
      }
    }
  }
}
