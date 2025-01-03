import { Colors } from '@loggings/beta'
import type { Expression, Identifier, PrivateIdentifier } from '../../../node_modules/meriyah/dist/src/estree.js'
import { ClassMemory } from '../../class/ClassMemory.js'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { Console } from '../../modules/console.js'

/**
 * Trata expressões, como: console.debug
 *
 * Usado em: parseCallExpression
 * @param {MemberExpression} expression
 * @returns {string}
 */
new Method<'MemberExpression', Map<string, string>>({
  type: 'MemberExpression',
  parser(expression, options) {
    const variables = Array.from(options.data?.entries() ?? [])
  
    if (expression.object.type === 'MetaProperty') {
      return options.subprocess<typeof expression.object.type, Expression | PrivateIdentifier>(
        expression.object.type,
        expression.object,
        expression.property
      )
    }
    
    const code: string[] = []
    const object = (expression.object as Identifier).name
    const property = (expression.property as Identifier).name

    if (!object) return Transpiler.parseReturnString(expression.property.type, property)

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
    let isClass: boolean = false
    Array.from(ClassMemory.all.values()).forEach((classs) => {
      if (classs.constant === object) isClass = true
    })
      
    if (isClass) {
      code.push(`"$${object}"_${property} ${(variables.map(([literals]) => literals)).join(' ').trim()}`)
      return breakLines(code)
    }

    switch (object) {
    case 'console': {
      code.push(new Console({
        methodName: property,
        variable: (variables.map(([, content]) => `${content}`)).join(' ').trim() }).parse())
      break
    }
    default: {
      console.debug(Colors('red', `[MemberExpression] Not identified: ${object}.${property}`))
      code.push(`${object}.${property}`)
    }
    }

    return breakLines(code)
  }
})