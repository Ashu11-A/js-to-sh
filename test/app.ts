import { Transpiler } from '@/class/transpiler.js'
import '@/index.js'
import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { join } from 'path'

const files = await glob(['**/*.ts'], { cwd: join(import.meta.dirname, 'modules') })

for (const file of files) {
  const path = join(import.meta.dirname, 'modules', file)
  const AST = await new Transpiler({ path, debug: false }).loader()
  const output = Transpiler.parser(AST)

  if (!existsSync('output')) await mkdir('output')
  await writeFile(`output/${file.replace('tests/', '').replace('.ts', '.sh')}`, output)
}