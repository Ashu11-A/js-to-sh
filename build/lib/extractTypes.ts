import ts from 'typescript'

/**
 * Represents the structure of a property extracted from a type.
 */
export type Properties = {
  /** The name of the type of the property. */
  type: string;
  /** The fully qualified type name of the property. */
  fullTypeName: string;
  /** The description of the property, typically extracted from JSDoc comments. */
  description: string;
  /** Indicates whether the property is optional. */
  isOptional: boolean;
  /** Nested properties, if the type is an object type. */
  properties?: Record<string, Properties>;
};

/**
 * Extracts type information from a TypeScript file.
 */
export class TypeExtractor {
  /**
   * TypeScript TypeChecker for performing type analysis.
   */
  private checker: ts.TypeChecker

  /**
   * The source file being analyzed.
   */
  private sourceFile: ts.SourceFile | undefined

  /**
   * Creates a new `TypeExtractor`.
   * @param fileName - The path to the TypeScript file.
   * @param typeName - The name of the type to extract information from.
   */
  constructor(private fileName: string, private typeName: string) {
    const program = ts.createProgram([fileName], {})
    this.sourceFile = program.getSourceFile(fileName)
    this.checker = program.getTypeChecker()
  }

  /**
   * Extracts properties and types from the specified type in the file.
   * @returns A record containing extracted properties of the type.
   */
  public extract(): Record<string, Properties> {
    if (!this.sourceFile) {
      console.error(`File ${this.fileName} not found.`)
      return {}
    }

    let result: Record<string, Properties> = {}

    const visit = (node: ts.Node) => {
      if (ts.isTypeAliasDeclaration(node) && node.name.text === this.typeName) {
        result = this.extractProperties(this.checker.getTypeAtLocation(node))
      }
    }

    ts.forEachChild(this.sourceFile, visit)
    return result
  }

  /**
   * Extracts the text of a JSDoc comment.
   * @param comment - The comment or array of comments to process.
   * @returns The concatenated text of the comments or undefined if no comment exists.
   */
  private getTextOfJSDocComment(comment?: string | ts.NodeArray<ts.JSDocComment>): string | undefined {
    if (!comment) return undefined
    if (typeof comment === 'string') return comment
    return comment.map((c) => c.getText()).join(' ')
  }

  /**
   * Gets the full type name, including union types if applicable.
   * @param type - The TypeScript type.
   * @returns A string representing the full type name.
   */
  private getFullTypeName(type: ts.Type): string {
    if (type.isUnion()) {
      return type.types.map((t) => this.getFullTypeName(t)).join(' | ')
    }
    return this.checker.typeToString(type)
  }

  /**
   * Checks if a given type is an object type.
   * @param type - The TypeScript type.
   * @returns `true` if the type is an object type; otherwise, `false`.
   */
  private isObjectType(type: ts.Type): boolean {
    return (type.flags & ts.TypeFlags.Object) !== 0
  }

  /**
   * Checks if a given type is an array type.
   * @param type - The TypeScript type.
   * @returns `true` if the type is an array type; otherwise, `false`.
   */
  private isArrayType(type: ts.Type): boolean {
    return this.checker.getIndexTypeOfType(type, ts.IndexKind.Number) !== undefined
  }

  /**
   * Extracts properties from a given type.
   * @param type - The TypeScript type.
   * @returns A record containing the extracted properties.
   */
  private extractProperties(type: ts.Type): Record<string, Properties> {
    const properties = type.getProperties()
    const result: Record<string, Properties> = {}

    properties.forEach((prop) => {
      const propType = this.checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!)
      const propTypeName = this.checker.typeToString(propType)
      const propTypeFullName = this.getFullTypeName(propType)
      const isOptional = !!prop.valueDeclaration && ts.isPropertySignature(prop.valueDeclaration) && !!prop.valueDeclaration.questionToken

      const jsDocComment = ts
        .getJSDocCommentsAndTags(prop.valueDeclaration!)
        .map((tag) => this.getTextOfJSDocComment(tag.comment))
        .join(' ')

      result[prop.getName()] = {
        type: propTypeName,
        fullTypeName: propTypeFullName,
        description: jsDocComment,
        isOptional,
        properties: this.isObjectType(propType) && !this.isArrayType(propType) ? this.extractProperties(propType) : undefined,
      }
    })
    return result
  }
}
