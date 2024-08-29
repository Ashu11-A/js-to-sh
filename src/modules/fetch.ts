import { Transpiler } from '@/class/transpiler.js'
import { Expression, ObjectExpression } from 'node_modules/meriyah/src/estree.js'

type Properties = 'url' | 'method' | 'headers' | 'body' | 'redirect' | 'referrer' | 'credentials'

export class ParseFetch {
  public AST: ObjectExpression
  constructor (AST: ObjectExpression) {
    this.AST = AST
  }

  parserProperties () {
    const properties =  this.AST.properties.map((property) => Transpiler.parseObjectLiteralElementLike(property) as [Properties, string, Expression['type']])
      .map(([property, value, type]) => [property, Transpiler.parseReturnString(type, value)])
    const ordering: (string | undefined)[] = []
    const code: string[] = []

    for (let line = 1; line < 7; line++) {
      ordering[line -1] = undefined
      for (const [property, value] of properties) {
        switch (line) {
        case 2: {
          if (property === 'method') ordering[0] = value
          break
        }
        case 3: {
          if (property === 'headers') ordering[1] = value
          break
        }
        case 4: {
          if (property === 'body') ordering[2] = value
          break
        }
        case 5: {
          if (property === 'redirect') ordering[3] = value
          break
        }
        case 6: {
          if (property === 'referrer') ordering[4] = value
          break
        }
        case 7: {
          if (property === 'credentials') ordering[5] = value
          break
        }
        }
      }
    }

    for (const property of ordering) {
      code.push(property ? property : '""')
    }

    return code.join(' ')
  }
}