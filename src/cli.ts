#!/usr/bin/env node

import '@/index.js'
import { mkdir, writeFile } from 'fs/promises'
import { Args } from './class/args.js'
import { Transpiler } from './class/transpiler.js'
import { glob } from 'glob'
import { dirname, join } from 'path'
import c from 'chalk'

global.console = {
  ...global.console,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message?: any, ...optionalParams: any[]) {
    if (JSON.parse(process.env['transpilerDebug'] ?? 'false')) process.stdout.write(`${message} ${optionalParams.join('\n')}\n`)
  },
}

const args = process.argv.slice(2).map((arg) => arg.replace('--', ''))
const code = new Map<string, string>()

new Args([
  {
    alias: ['-D'],
    command: 'debug',
    description: 'Activates debug mode.',
    rank: 0,
    async function() {
      process.env['transpilerDebug'] = 'true'
    },
  },
  {
    alias: ['-d'],
    command: 'dir',
    description: 'Directory for fetching and transpiling .js files',
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
    description: 'File to be transpiled.',
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
    description: 'Output directory or file to save the transpiled files.',
    rank: 9,
    hasString: true,
    async function(content) {
      if (content === undefined) throw new Error('--output requires an input')
      const codes = code.entries()

      if (code.size > 1 && content.includes('.sh')) throw new Error(`Output was declared to be ${content}, but you passed a directory, it is not possible to process several files and save them in a single file`)
      for (const [path, output] of codes) {
        const pathFile = join(process.cwd(), content)

        if (content.includes('.sh')) {
          await writeFile(pathFile, output, { encoding: 'utf-8' })
          console.log(`${c.yellow('Transpiled:')} ${c.blueBright(path)} ➤ ${c.hex('#0ce829')(content)}`)
          continue
        }
        if (code.size > 1) {
          await mkdir(dirname(join(pathFile, path)), { recursive: true })
          writeFile(join(pathFile, path).replace('.ts', '.sh').replace('.js', '.sh'), output, { encoding: 'utf-8' })
          continue
        }
        throw new Error(`Output ${content} is invalid!`)
      }
    },
  }
]).run(args)