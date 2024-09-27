import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'

/**
 * Formata For of
 * 
 * Input:
 * const numbers = [0, 2, 4]
 * 
 * for (const number of numbers) {
 *   console.debug(number)
 * }
 * 
 * Output:
 * numbers=(0 2 4)
 * 
 * for number in "${numbers[@]}"; do
 *   echo "$number"
 * done
 *
 * @returns {string}
 */
new Method({
  type: 'ForOfStatement',
  parser(node, options) {
    const code: string[] = []
    const left = options.subprocess(node.left.type, node.left)
    const right = options.subprocess(node.right.type, node.right)
    const body = options.subprocess(node.body.type, node.body)

    code.push(`\n${getTabs(Transpiler.tabs)}for ${left} in "$\{${right}[@]}"; do`)
    Transpiler.tabs = Transpiler.tabs + 1
    code.push(getTabs(Transpiler.tabs) + body)
    Transpiler.tabs = Transpiler.tabs - 1
    code.push(`${getTabs(Transpiler.tabs)}done`)
    return breakLines(code)
  }
})