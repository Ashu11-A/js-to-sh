import { Transpiler } from '../class/transpiler.js'
import '../index.js'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { join } from 'path'

const path = join(import.meta.dirname, 'modules')
const files = await glob(['**/*.js'], { cwd: path })

console.log(files)

for (const file of files) {
  const pathFile = join(path, file)
  const AST = await new Transpiler({ path: pathFile, debug: true }).loader()
  const output = Transpiler.parser(AST)

  if (!existsSync('output')) await mkdir('output')
  await writeFile(`output/${file.replace('tests/', '').replace('.js', '.sh')}`, output)
}