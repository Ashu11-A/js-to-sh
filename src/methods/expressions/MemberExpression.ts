import { Colors } from '@loggings/beta'
import type { Expression, Identifier, PrivateIdentifier } from '../../../node_modules/meriyah/dist/src/estree.js'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { Console } from '../../modules/console.js'
import { ParserClass } from './ClassDeclaration.js'

/**
 * Trata expressões, como: console.debug
 *
 * Usado em: parseCallExpression
 * @param {MemberExpression} expression
 * @returns {string}
 */
new Method<'MemberExpression', string>({
  type: 'MemberExpression',
  parser(expression, options) {
    const arg = options.data

    if (expression.object.type === 'MetaProperty') {
      return options.subprocess<typeof expression.object.type, Expression | PrivateIdentifier>(expression.object.type, expression.object, expression.property)
    }
    
    const code: string[] = []
    const object = (expression.object as Identifier).name
    const property = (expression.property as Identifier).name

    if (object === undefined) return Transpiler.parseReturnString(expression.property.type, property)

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
      console.debug(Colors('red', `[parseMemberExpression] Not identified: ${object}.${property}`))
      code.push(`${object}.${property}`)
    }
    }

    return breakLines(code)
  }
})