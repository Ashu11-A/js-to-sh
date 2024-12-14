import { randomUUID } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { basename } from 'path'
import type { Expression, MemberExpression, SpreadElement } from '../../../node_modules/meriyah/dist/src/estree.js'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'
import { getTransformer, getTransformers } from '../../loader.js'
import type { ASTNode } from '../../types/methods.js'

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
      const code: string[] = []
      const values: Array<{ type: ASTNode['type'], value: string }> = []
      const variables = new Map<string, string>()

      args.forEach((arg) =>{
        const parsed = Transpiler.parseReturnString(arg.type, options.subprocess(arg.type, arg))

        values.push({ type: arg.type, value: parsed })
      })

      values.forEach((item) => {
        switch (item.type) {
        case 'CallExpression': {
          const variableName = `result_${randomUUID().replaceAll('-', '')}`
              
          variables.set(item.value, `$${variableName}`)
          code.push(`${getTabs(Transpiler.tabs)}${variableName}=${item.value}`)
          break
        }
        default: {
          variables.set(item.value, item.value)
        }
        }

      })

      // Isso vai para MemberExpression, se não ficou obvio
      code.push(options.subprocess<typeof callee.type, Map<string, string>>(
        callee.type,
        callee,
        variables
      ) as string)
      return breakLines(code)
    } else {
      const functionName = expression.callee.name
      const transformers: Record<string, string> = {}
      getTransformers().map((transformer) => Object.assign(transformers, { [basename(transformer)]: transformer }))

      /**
       * Aqui é definido o transformers de certas funções, como o fetch, onde é puxado a função que trata o fetch entre curl e wget, e o isCommand para validar se existe as dependencias
       */
      switch (functionName) {
      case 'fetch': {    
        Transpiler.globalDeclarations.set('isCommand', getTransformer('isCommand.sh'))
        Transpiler.globalDeclarations.set('fetch', getTransformer('fetch.sh'))
        break
      }
      }

      const args = expression.arguments.map((arg) => Transpiler.parseReturnString(arg.type, options.subprocess(arg.type, arg) as string)) as (string)[]
      const transformer = transformers[`${functionName}.sh`]

      if (existsSync(transformer)) {
        const transformerCode = readFileSync(transformer, { encoding: 'utf-8' })
        Transpiler.globalDeclarations.set(functionName, transformerCode)
      }

      return `${functionName} ${args.length > 0 ? args.join(' ') : ''}`
    }
  }
})