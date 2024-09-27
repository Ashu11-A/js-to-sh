import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { breakLines } from '../../libs/breakLines.js'
import { getTabs } from '../../libs/getTabs.js'

new Method({
  type: 'SwitchStatement',
  parser(node, options) {
    const code: string[] = []
    const discriminant = options.subprocess(node.discriminant.type, node.discriminant)
    
    code.push(`${getTabs(Transpiler.tabs)}case $${discriminant} in`)
    Transpiler.tabs++

    for (const caseNode of node.cases) {
      Transpiler.tabs++
      if (caseNode.test) {
        const testValue = options.subprocess(caseNode.test.type, caseNode.test)
        code.push(`${getTabs(Transpiler.tabs)}"${testValue}")`)
      } else {
        code.push(getTabs(Transpiler.tabs) + '*))')
      }
    
      Transpiler.tabs++
    
      code.push(getTabs(Transpiler.tabs) + breakLines(caseNode.consequent.map((consequent) => options.subprocess(consequent.type, consequent)) as string[]))
      code.push(getTabs(Transpiler.tabs) + ';;')
    
      Transpiler.tabs--
      Transpiler.tabs--
    }
    code.push(getTabs(Transpiler.tabs) + 'esac')
    Transpiler.tabs--
    return breakLines(code)
  }
})