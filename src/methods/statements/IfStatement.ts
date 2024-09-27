import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import type { ElseStatement } from '../../types/methods.js'

/**
  * Formata todos os If para shell script
  *
  * @param {IfStatement} expression
  */
new Method({
  type: 'IfStatement',
  parser (node, options) {
    Transpiler.tabs++

    const test = options.subprocess(node.test.type, node.test)
    const consequent = options.subprocess(node.consequent.type, node.consequent) as string
    const ElseStatement = Method.get('ElseStatement')!
    const alternate = node.alternate
      ? ElseStatement.interaction.parser(node.alternate as unknown as ElseStatement, {
        parser: ElseStatement.interaction.parser,
        type: ElseStatement.interaction.type,
        subprocess: ElseStatement.subprocess
      }) as string
      : ''
    const code: string[] = []

    code.push(`${Transpiler.tabs >= 1 ? '\n' : ''}if ${test}; then`)
    code.push(consequent)
    if (alternate.length > 0) code.push(alternate)
    code.push(`fi${Transpiler.tabs >= 1 ? '\n' : ''}`)

    Transpiler.tabs--
    return breakLines(code)
  }
})