import { Loggings, LoggingsRegister } from '@loggings/beta'
Loggings.rem(LoggingsRegister.identify)
Loggings.useConsole(new Loggings())

import { existsSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { join } from 'path'
import { Transpiler } from '../src/class/transpiler.js'
import '../src/index.js'

const path = join(import.meta.dirname, 'modules')
const files = await glob(['**/*.js'], { cwd: path })

for (const file of files) {
  const pathFile = join(path, file)
  const output = new Transpiler({ sourcePath: pathFile, debug: true }).parser()

  if (!existsSync('output')) await mkdir('output')
  await writeFile(`output/${file.replace('tests/', '').replace('.js', '.sh')}`, output)
}