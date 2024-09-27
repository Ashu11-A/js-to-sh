import ts from 'typescript'

export type Properties = {
  type: string,
  fullTypeName: string
  description: string
  isOptional: boolean
  properties?: Record<string, Properties>
}

export function extractTypes(fileName: string, typeName: string) {
  let result: Record<string, Properties> = {}
  const program = ts.createProgram([fileName], {})
  const sourceFile = program.getSourceFile(fileName)
  
  if (!sourceFile) {
    console.error(`File ${fileName} not found.`)
    return
  }
  
  const checker = program.getTypeChecker()
  
  function getTextOfJSDocComment(comment?: string | ts.NodeArray<ts.JSDocComment>): string | undefined {
    if (!comment) return undefined
    if (typeof comment === 'string') return comment
    return comment.map(c => c.getText()).join(' ')
  }

  function getFullTypeName(type: ts.Type): string {
    if (type.isUnion()) {
      return type.types.map(t => getFullTypeName(t)).join(' | ')
    }
    return checker.typeToString(type)
  }

  function isObjectType(type: ts.Type): boolean {
    return (type.flags & ts.TypeFlags.Object) !== 0
  }

  function isArrayType(type: ts.Type): boolean {
    return checker.getIndexTypeOfType(type, ts.IndexKind.Number) !== undefined
  }
  
  function extractProperties(type: ts.Type) {
    const properties = type.getProperties()
    const result: Record<string, Properties> = {}

    properties.forEach(prop => {
      const propType = checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!)
      const propTypeName = checker.typeToString(propType)
      const propTypeFullName = getFullTypeName(propType)
      const isOptional = !!prop.valueDeclaration && ts.isPropertySignature(prop.valueDeclaration) && !!prop.valueDeclaration.questionToken

      const jsDocComment = ts.getJSDocCommentsAndTags(prop.valueDeclaration!).map(tag => getTextOfJSDocComment(tag.comment)).join(' ')

      result[prop.getName()] = {
        type: propTypeName,
        fullTypeName: propTypeFullName,
        description: jsDocComment,
        isOptional,
        properties: isObjectType(propType) && !isArrayType(propType) ? extractProperties(propType) : undefined
      }
    })
    return result
  }

  function visit(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
      result = extractProperties(checker.getTypeAtLocation(node))
    }
  }
  
  ts.forEachChild(sourceFile, visit)
  return result
}