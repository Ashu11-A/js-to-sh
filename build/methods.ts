import { AST_NODE_TYPES, parse } from '@typescript-eslint/typescript-estree'
import { readFile } from 'fs/promises'
import type { CallExpressionArgument, Expression, ObjectLiteralElement, ProgramStatement } from '../node_modules/@typescript-eslint/types/dist/generated/ast-spec.js'
import { extractTypes } from './lib/extractTypes.js'

export async function getMethods (path: string) {
  const keys = Object.keys(extractTypes('./src/types/methods.ts', 'ASTMap') ?? {})
  const typesUsage: string[] = []
  const code = await readFile(path, 'utf8')
  const ast = parse(code, {
    loc: true,
    range: true,
    comment: true,
    tokens: true,
  })

  function analyzeAST(node: ProgramStatement) {
    switch (node.type) {
    case AST_NODE_TYPES.ExpressionStatement:
      analyzeExpression(node.expression)
      break
    }
  }

  function analyzeExpression(expression: Expression) {
    switch (expression.type) {
    case AST_NODE_TYPES.NewExpression:
      expression.arguments.forEach(analyzeArgument)
      break
    }
  }

  function analyzeArgument(arg: CallExpressionArgument) {
    if (arg.type === AST_NODE_TYPES.ObjectExpression) {
      arg.properties.forEach(analyzeProperty)
    }
  }

  function analyzeProperty(prop: ObjectLiteralElement) {
    if (prop.type === AST_NODE_TYPES.Property && prop.value.type === AST_NODE_TYPES.Literal) {
      const value = prop.value.value

      if (typeof value !== 'string') return
      if (keys.includes(value)) {
        typesUsage.push(value)
      }
    }
  }

  ast.body.forEach(analyzeAST)

  return typesUsage
}

