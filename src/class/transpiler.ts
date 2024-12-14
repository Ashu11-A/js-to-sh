/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Colors, Rgb } from '@loggings/beta'
import { breakLines } from '../libs/breakLines.js'
// @ts-ignore
import AbstractSyntaxTree from 'abstract-syntax-tree'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Expression, PrivateIdentifier, Program } from '../../node_modules/meriyah/dist/src/estree.js'
import { Method } from './methods.js'

type TransformOptions = {
  removeComments?: boolean
  sourcePath: string
  cwd?: string
  debug?: boolean
}

export class Transpiler {
  public ast: Program
  static tabs: number = 0
  static options: TransformOptions
  static globalDeclarations = new Map<string, string>()

  constructor(options: TransformOptions) {
    Transpiler.options = {
      ...options,
      sourcePath: join(options.cwd ?? '', options.sourcePath)
    }

    this.ast = Transpiler.loader()

    // @ts-ignore
    global.loggings.config({ format: '{message}', level: Transpiler.options?.debug ? 'debug' : 'info' })

    console.debug(Rgb(249, 248, 113) + 'Debug Mode!')
    console.debug(Rgb(132, 94, 194) + 'Transpiling:', Rgb(255, 199, 95) + Transpiler.options.sourcePath)
  }

  /**
   * Carrega o AST do javascript, gera um json com todas as informações necessarias para a conversão para shell script
   *
   * @param {string | undefined} code
   * @returns {Promise<(Program)>}
   */
  static loader(code?: string): Program {
    if (code === undefined) code = readFileSync(Transpiler.options.sourcePath, { encoding: 'utf-8' })
    const AST = new AbstractSyntaxTree(code)
    return AST
  }

  parser(ast?: Program) {
    ast = ast ?? this.ast
    let output: string[] = []
  
    for (const body of ast.body) {
      const method = Method.all.get(body.type)
  
      if (!method) {
        console.debug(Rgb(255, 220, 0) + `[${body.type}] ` + Colors('red', 'Not defined'))
        continue
      }
  
      const source = method.interaction.parser(body, {
        type: method.interaction.type,
        parser: method.interaction.parser,
        subprocess: method.subprocess
      }) as string
  
      output.push(source)
    }
  
    const globalDeclarations = Array.from(Transpiler.globalDeclarations.values())
    Transpiler.globalDeclarations.clear()
    
    output.unshift(...globalDeclarations)

    if (Transpiler.options.removeComments) {
      output = output.map((content) => {
        const array = content.split('\n')
        for (const [index, value] of Object.entries(array)) {
          array[Number(index)] = (value.trim()).startsWith('#') ? '(REMOVE)' : value
        }
        return array.filter((line) => line !== '(REMOVE)').join('\n')
      })
    }

    output.unshift('#!/bin/bash\n')
  
    return breakLines(output)
  }
  

  /**
   * Retorna o operador equivalente do javascript para o shell script
   *
   * @param {string} value
   * @returns {string}
   */
  static parseOperator(value: string): string {
    return (value === '===' || value === '==')
      ? '=='
      : ['!==', '!='].includes(value)
        ? '!='
        // : value
        : value === '>'
          ? '-gt'
          : value === '>='
            ? '-ge'
            : value === '<'
              ? '-lt'
              : value === '<='
                ? '-le'
                : value
  }

  /**
   * Formata retornos de strings para diversos tipo de uso (if, echo)
   *
   * @param {Expression['type']} type
   * @param {(string | string[])} content
   * @returns {string}
   */
  static parseReturnString(type: Expression['type'] | PrivateIdentifier['type'], content: string | string[] | boolean | number): string {
    console.log(type)
    console.log(content)
    content = Array.isArray(content)
      ? content.map((value) => String(value).trim())
      : typeof content === 'boolean'
        ? (content === true ? '0' : '1')
        : typeof content === 'number'
          ? content
          : content.trim()

    switch (type) {
    // Identifier são constantes: const num = 0
    case 'Identifier': return `"$${content}"`
      // Literal são strings ou numbers
    case 'Literal': return !Number.isNaN(Number(content)) ? `${content}` : `"${content}"`
    case 'CallExpression': return `$(eval ${content})`
    case 'ArrayExpression': return `(${(content as string[]).join(' ')})`
    case 'ArrowFunctionExpression': return `${content}`
    case 'ObjectExpression': return `${content}`
    // case 'MemberExpression': return `$(${content})`
    }

    // console.debug(Colors('red', `[parseReturnString] Not identified: ${type} ${content}`))
    return `"${content}"`
  }
}