import { existsSync, readFileSync } from 'fs'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { getTransformers } from '../../loader.js'
import { basename } from 'path'
import { type Expression, type MemberExpression, type SpreadElement } from '../../../node_modules/meriyah/src/estree.js'

/**
 * Formata chamadas de funções junto com suas args
 * 
 * Input: function(arg) {}
 * Output: function ${arg}
 *
 * @param {CallExpression} expression
 * @returns {string}
 */
new Method({
  type: 'CallExpression',
  parser(expression, options) {
    if (expression.callee.type === 'MemberExpression') {
      const callee = expression.callee as MemberExpression
      const args = expression.arguments as (Expression | SpreadElement)[]

      // Isso vai para MemberExpression, se não ficou obvio
      return options.subprocess<typeof callee.type, string>(callee.type, callee, args.map((arg) => Transpiler.parseReturnString(arg.type, options.subprocess(arg.type, arg) as string)).join(' '))
    } else {
      const functionName = expression.callee.name
      const transformers: Record<string, string> = {}
      getTransformers().map((transformer) => Object.assign(transformers, { [basename(transformer)]: transformer }))

      /**
       * Aqui é definido o transformers de certas funções, como o fetch, onde é puxado a função que trata o fetch entre curl e wget, e o isCommand para validar se existe as dependencias
       */
      switch (functionName) {
      case 'fetch': {
        const fetchCode = readFileSync(transformers['fetch.sh'], { encoding: 'utf-8' })
        const isCommandCode = readFileSync(transformers['isCommand.sh'], { encoding: 'utf-8' })
        Transpiler.globalDeclarations = Object.assign({ 'isCommand': isCommandCode, 'fetch': fetchCode }, Transpiler.globalDeclarations)
        break
      }
      }

      const args = expression.arguments.map((arg) => Transpiler.parseReturnString(arg.type, options.subprocess(arg.type, arg) as string)) as (string)[]

      const transformer = transformers[`${functionName}.sh`]

      if (existsSync(transformer)) {
        const transformerCode = readFileSync(transformer, { encoding: 'utf-8' })
        Transpiler.globalDeclarations = Object.assign(Transpiler.globalDeclarations, { [functionName]: transformerCode })
      }

      return `${functionName} ${args.length > 0 ? args.join(' ') : ''}`
    }
  }
})