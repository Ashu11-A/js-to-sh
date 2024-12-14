import { dirname, join, resolve } from 'path'
import { Method } from '../../class/methods.js'
import { Transpiler } from '../../class/transpiler.js'
import { existsSync, readFileSync } from 'fs'
import { Colors } from '@loggings/beta'

/**
 * Formata os imports de arquivo, ainda em experimento, e não deve se usar para arquivos externos, apenas arquivos previamente processados por essa biblioteca!
 *
 * @param {ImportDeclaration} node
 * @returns {string}
 */
new Method({
  type: 'ImportDeclaration',
  parser(node, options) {
    const packagee = options.subprocess(node.type, node) as string
    const path = dirname(resolve(Transpiler.options.sourcePath))

    if (!existsSync(join(path, packagee))) {
      throw new Error(Colors('red', `[${packagee}] It is not possible to use external or internal packages.`))
    }
    // Pega o caminho relativo dos transformadores, com base no path do arquivo
    const filePath = join(path, packagee.replace('javascript', 'shellscript').replace('.js', '.sh'))
    const code = readFileSync(filePath, { encoding: 'utf-8' })

    return code
  }
})