import { glob } from 'glob'
import { join } from 'path'
import Transpiler from './class/transpiler.js'
import { mkdir, writeFile } from 'fs/promises'
import { breakLines } from './libs/breakLines.js'
import { existsSync } from 'fs'

const files = await glob(['**/*.ts'], { cwd: join(process.cwd(), 'src/connects') })

for (const file of files) {
  const path = join(process.cwd(), 'src/connects', file)
  const transform = new Transpiler({ path, debug: true })
  const output = transform.parser(await transform.loader())

  if (!existsSync('output')) await mkdir('output')
  await writeFile(`output/${file.replace('tests/', '').replace('.ts', '.sh')}`, breakLines(output))
}