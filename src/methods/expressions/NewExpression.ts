import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { getTransformer } from '../../loader.js'

/**
 * Estrutura a classe
 * 
 * Input: const pessoa = new Pessoa('Matheus', '18')
 * 
 * Output:
 * pessoa="pessoa"
 * new_Pessoa $pessoa "Matheus" 18
 *
 * @param {NewExpression} expression
 * @returns {string}
 */
new Method({
  type: 'NewExpression',
  parser(expression, options) {
    const className = options.subprocess(expression.callee.type, expression.callee) as string
    const args = expression.arguments.map((arg) => Transpiler.parseReturnString(arg.type, options.subprocess(arg.type, arg) as string))

    switch (className) {
    case 'Map': {
      Transpiler.globalDeclarations.set('map', getTransformer('map'))
      break
    }
    case 'Set': {
      Transpiler.globalDeclarations.set('set', getTransformer('set'))
    }
    }
    
    /**
     * (ARG): será substituido em parseVariableDeclaration, lá será definido o this.constant dessa class (ParserClass)
     */
    return `new_${className} (ARG) ${args.join(' ')}`
  }
})