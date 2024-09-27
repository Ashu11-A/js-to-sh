import { Rgb } from '@loggings/beta'
import type { ASTMap, ExistsMethods, MethodProps, MethodTypes } from '../types/methods.js'

export class Method<T extends MethodTypes, D = undefined> {
  static all = new Map<MethodTypes, Method<MethodTypes, unknown>>()
  static get<T extends ExistsMethods>(methodType: T) {
    return this.all.get(methodType) as Method<T> | undefined
  }

  constructor(public interaction: MethodProps<T, D>){
    Method.all.set(this.interaction.type, this as unknown as Method<MethodTypes, unknown>)
  }

  subprocess<T extends MethodTypes, D = undefined>(methodType: T, node: ASTMap[T], data: D): string | string[] {
    if (methodType === undefined) throw new Error('Not identified methodType')
    const method = Method.all.get(methodType)

    if (method === undefined) {
      console.debug(`[${methodType}] Not identified`)
      return ''
    }
    const output = method.interaction.parser(node as ASTMap[ExistsMethods], { parser: method.interaction.parser, type: method.interaction.type, subprocess: method.subprocess, data })

    console.debug(Rgb(255, 220, 0) + `[${methodType}] ` + Rgb(0, 224, 255) + output)
    return output
  }
}