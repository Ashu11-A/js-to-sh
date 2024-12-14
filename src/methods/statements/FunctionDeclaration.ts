import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'

/**
 * Formata funções
 * @returns {string}
 */
new Method({
  type: 'FunctionDeclaration',
  parser(node, options) {
    if (node.id === null) {
      console.debug('[FunctionDeclaration] node.id is null')
      return ''
    }

    if (node.body === null || node.body === undefined) {
      console.debug('[FunctionDeclaration] node.id is null')
      return ''
    }

    const code: string[] = []
    const params = node.params.map((param) => options.subprocess(param.type, param)) as []
    const functionName = options.subprocess(node.id?.type, node.id) as string


    code.push(`${getTabs(Transpiler.tabs)}function ${functionName}() {`)

    Transpiler.tabs++
    for (const [index, param] of Object.entries(params)) {
      code.push(`${getTabs(Transpiler.tabs)}local ${param}=$${Number(index) + 1}`)
    }

    code.push(options.subprocess(node.body.type, node.body) as string)
    Transpiler.tabs--
    code.push(getTabs(Transpiler.tabs) + '}\n')

    return breakLines(code)
  }
})