#!/usr/bin/env node

import './index.js'
import { Colors, Loggings, LoggingsRegister, Rgb, } from '@loggings/beta'
import { Transpiler } from './class/transpiler.js'

Loggings.rem(LoggingsRegister.identify)
Loggings.useConsole(new Loggings())

import { mkdir, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import * as packageJ from '../package.json' with { type: 'json' }
import { Args } from './class/args.js'

const args = process.argv.slice(2).map((arg) => arg.replace('--', ''))
const code = new Map<string, string>();

(() => {
  if (process.argv[1] !== fileURLToPath(import.meta.url) && !Object.keys(packageJ.default.bin).includes(basename(process.argv[1]))) return
  new Args([
    {
      alias: ['-h'],
      command: 'help',
      description: 'Show all available arguments',
      rank: 0,
      async function() {
        console.log(Args.help())
        process.exit()
      },
    },
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
          const output = new Transpiler({ sourcePath: file, debug: false }).parser()
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
        const output = new Transpiler({ sourcePath: content, debug: JSON.parse(process.env['transpilerDebug'] ?? 'false') }).parser()
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
            console.log(`${Colors('yellow','Transpiled:')} ${Colors('blue', path)} ➤ ${Rgb(12, 232, 41) + (content)}`)
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
})()