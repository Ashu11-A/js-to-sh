/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Colors, Rgb } from '@loggings/beta'
import { breakLines } from '../libs/breakLines.js'
// @ts-ignore
import AbstractSyntaxTree from 'abstract-syntax-tree'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Expression, PrivateIdentifier, Program } from '../../node_modules/meriyah/dist/src/estree.js'
import { Method } from './methods.js'

interface TransformOptions {
  path: string
  cwd?: string
  debug?: boolean
}

export class Transpiler {
  static tabs: number = 0
  static options: TransformOptions
  static globalDeclarations: Record<string, string> = {}
  public ast: Program

  constructor(options: TransformOptions) {
    Transpiler.options = {
      ...options,
      path: join(options.cwd ?? '', options.path)
    }

    this.ast = Transpiler.loader()

    // @ts-ignore
    global.loggings.config({ format: '{message}', level: Transpiler.options?.debug ? 'debug' : 'info' })

    console.debug(Rgb(249, 248, 113) + 'Debug Mode!')
    console.debug(Rgb(132, 94, 194) + 'Transpiling:', Rgb(255, 199, 95) + Transpiler.options.path)
  }

  /**
   * Carrega o AST do javascript, gera um json com todas as informações necessarias para a conversão para shell script
   *
   * @param {string | undefined} code
   * @returns {Promise<(Program)>}
   */
  static loader(code?: string): Program {
    if (code === undefined) code = readFileSync(Transpiler.options.path, { encoding: 'utf-8' })
    const AST = new AbstractSyntaxTree(code)
    return AST
  }

  parser (ast?: (Program)) {
    const code: string[] = []
    ast = ast ?? this.ast

    code.push('#!/bin/bash\n')

    for (const body of ast.body) {
      const method = Method.all.get(body.type)
      
      if (method === undefined) { console.debug(Rgb(255, 220, 0) + `[${body.type}] ` + Colors('red', 'Not defined')); continue }
      const source = method.interaction.parser(body, { type: method.interaction.type, parser: method.interaction.parser, subprocess: method.subprocess }) as string

      for (const [, codeSource] of Object.entries(Transpiler.globalDeclarations)) {
        code.push(codeSource)
      }
  
      Transpiler.globalDeclarations = {}
      code.push(source)
    }

    return breakLines(code)
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
  static parseReturnString(type: Expression['type'] | PrivateIdentifier['type'], content: string | string[]): string {
    switch (type) {
    // Identifier são constantes: const num = 0
    case 'Identifier': return `"$${content}"`
      // Literal são strings ou numbers
    case 'Literal': return !Number.isNaN(Number(content)) ? `${content}` : `"${content}"`
    case 'CallExpression': return `$(${content})`
    case 'ArrayExpression': return `(${(content as string[]).join(' ')})`
    case 'ArrowFunctionExpression': return `${content}`
    case 'ObjectExpression': return `${content}`
    }

    // console.debug(Colors('red', `[parseReturnString] Not identified: ${type} ${content}`))
    return `"${content}"`
  }
}