import '@/index.js'
import { mkdir, writeFile } from 'fs/promises'
import { Args } from './class/args.js'
import Transpiler from './class/transpiler.js'
import { glob } from 'glob'
import { dirname, join } from 'path'

global.console = {
  ...global.console,
  debug(...messages: unknown[]) {
    if (JSON.parse(process.env['transpilerDebug'] ?? 'false')) process.stdout.write(messages.join('\n'))
  },
}

const args = process.argv.slice(2).map((arg) => arg.replace('--', ''))
const code = new Map<string, string>()

new Args([
  {
    alias: ['-d'],
    command: 'debug',
    rank: 0,
    async function() {
      process.env['transpilerDebug'] = 'true'
    },
  },
  {
    alias: ['-D'],
    command: 'dir',
    hasString: true,
    rank: 1,
    async function(content) {
      if (content === undefined) throw new Error('Dir not expecificate')
      if (!(await isDir(content))) throw new Error('Directory specified invalid')
      const files = await glob(`${content}/**/*.{js,ts}`, { cwd: process.cwd() })

      for (const file of files) {
        const output = Transpiler.parser((await new Transpiler({ path: file, debug: false }).loader()))
        code.set(file.split('/').slice(1).join('/'), output)
      }
    },
  },
  {
    alias: ['-f'],
    command: 'file',
    rank: 1,
    hasString: true,
    async function(content) {
      if (content === undefined) throw new Error('File not expecificate')
      const output = Transpiler.parser((await new Transpiler({ path: content, debug: false }).loader()))
      code.set(content, output)
    },
  },
  {
    alias: ['-o'],
    command: 'output',
    rank: 9,
    hasString: true,
    async function(content) {
      if (content === undefined) throw new Error('--output requires an input')
      const codes = code.entries()

      if (code.size > 1 && content.includes('.sh')) throw new Error(`Output was declared to be ${content}, but you passed a directory, it is not possible to process several files and save them in a single file`)
      for (const [path, code] of codes) {
        const pathFile = join(process.cwd(), content)

        if (content.includes('.sh')) {
          await writeFile(pathFile, code, { encoding: 'utf-8' })
        } else {
          await mkdir(dirname(join(pathFile, path)), { recursive: true })
          writeFile(join(pathFile, path).replace('.ts', '.sh').replace('.js', '.sh'), code, { encoding: 'utf-8' })
        }
        
      }
    },
  }
]).run(args)