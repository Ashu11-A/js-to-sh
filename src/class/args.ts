import { Arg } from '../types/args.js'
import { Colors } from '@loggings/beta'

export class Args {
  static args: Arg[] = []
  constructor(args: Arg[]) {
    Args.args = args
  }

  validate(input: string[]) {
    for (const arg of input.filter((arg) => arg.includes('-'))) {
      const allArgs = Args.args.flatMap(({ command, alias }) => [command, ...alias.map((alia) => alia || command)])
      if (!allArgs.includes(arg)) throw new Error(`Not found arg ${arg}, try --help`)
    }
  }

  formatAliasToCommand(input: string[]): Arg[] {
    const newArgs: Array<Arg> = []

    for (let argIndex = 0; argIndex < input.length; argIndex++) {
      for (const arg of Args.args) {
        if (arg.alias.includes(input[argIndex]) || input[argIndex] === arg.command) {
          if (arg?.hasString) {
            // caso a proxima arg seja não seja uma strings, e sim uma arg
            if (input[argIndex + 1]?.startsWith('-')) {
              newArgs.push(arg)
              continue
            }
            ++argIndex
            newArgs.push({ ...arg, string: input[argIndex] })
            continue
          }
          newArgs.push(arg)
          continue
        }
      }
    }

    return newArgs
  }

  quickSort (args: Arg[]): Arg[] {
    return args.sort((A, B) => A.rank - B.rank)
  }

  static help () {
    const output: string[] = []
    output.push(`Usage: ${Colors('yellow', 'tjss')} ${Colors('magenta', '[options]')}\n`)
    output.push('  Options:\n')

    const maxAliasLength = Math.max(...Args.args.map(arg => arg.alias.join(', ').length))
    const maxCommandLength = Math.max(...Args.args.map(arg => `--${arg.command}`.length))

    for (const arg of Args.args) {
      const alias = arg.alias.join(', ')
      const command = `--${arg.command}`
      const aliasPadding = ' '.repeat(maxAliasLength - alias.length)
      const commandPadding = ' '.repeat(maxCommandLength - command.length)

      output.push(`   ${Colors('blue', alias)}${aliasPadding} ${Colors('white', command)}${commandPadding} ${Colors('green', arg.description)}`)
    }
    return output.join('\n')
  }

  async run(input: string[]) {
    this.validate(input)

    const args = this.quickSort(this.formatAliasToCommand(input))
    if (args.length === 0) {
      console.log(Args.help())
      return
    }
    for (const arg of args) {
      await arg.function(arg.string)
    }
  }
}