import type { Expression, IfStatement, ObjectLiteralElementLike, Parameter, PrivateIdentifier, Statement } from '../../node_modules/meriyah/dist/src/estree.js'

export type ElseStatement =  ({
    type: 'ElseStatement'
}) & Omit<IfStatement, 'type'>

export type ASTNode = Statement | Expression | PrivateIdentifier | Parameter | ElseStatement | ObjectLiteralElementLike
export type ASTMap = {
    [NodeType in ASTNode as NodeType['type']]: NodeType
}
export type MethodTypes = keyof ASTMap

export type MethodProps<T extends MethodTypes, D = undefined> = {
    type: T
    data?: D
    parser: (node: ASTMap[T], options: MethodProps<T, D> & { subprocess<T extends MethodTypes, D>(methodType: T, node: ASTMap[T], data?: D): string | string[] }) => string | string[]
}

/* Start Generate By Build */
export type ExistsMethods = ASTMap['ArrayExpression' | 'ArrowFunctionExpression' | 'AwaitExpression' | 'BinaryExpression' | 'CallExpression' | 'ClassDeclaration' | 'FunctionExpression' | 'Identifier' | 'Literal' | 'MemberExpression' | 'MetaProperty' | 'NewExpression' | 'ObjectExpression' | 'PrivateIdentifier' | 'TemplateLiteral' | 'Property' | 'BlockStatement' | 'BreakStatement' | 'ElseStatement' | 'ExpressionStatement' | 'ForOfStatement' | 'FunctionDeclaration' | 'IfStatement' | 'ImportDeclaration' | 'ReturnStatement' | 'SwitchStatement' | 'VariableDeclaration']['type']
/* End Generate By Build */