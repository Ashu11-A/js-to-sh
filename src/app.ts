import { glob } from 'glob'
import { join } from 'path'
import Transpiler from './class/transpiler.js'
import { mkdir, writeFile } from 'fs/promises'
import { breakLines } from './libs/breakLines.js'
import { existsSync } from 'fs'

const files = await glob(['**/*.ts'], { cwd: join(process.cwd(), 'tests') })

for (const file of files) {
  const path = join(process.cwd(), 'tests', file)
  const AST = await new Transpiler({ path, debug: false }).loader()
  const output = Transpiler.parser(AST)

  if (!existsSync('output')) await mkdir('output')
  await writeFile(`output/${file.replace('tests/', '').replace('.ts', '.sh')}`, breakLines(output))
}