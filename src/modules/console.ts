import { getTabs } from 'src/libs/getTabs.js'
import Transpiler from '../class/transpiler.js'
import { breakLines } from 'src/libs/breakLines.js'

interface ConsoleOptions {
    methodName: string
    variable?: string
    transpiler: Transpiler
}

export class Console {
  private readonly options: ConsoleOptions

  constructor(options: ConsoleOptions) {
    this.options = Object.assign(options, {
      variable: options.variable?.replaceAll('"', '') ?? undefined
    })
  }

  parse(): string {
    const shellCommand = this.map()

    return shellCommand
  }
  
  /**
   * Mapeamento das funções disponiveis para console
   *
   * @returns {string}
   */
  map(): string {
    switch (this.options.methodName) {
    case 'clear':
      return 'clear'
    case 'debug':
    case 'log':
    case 'info':
    case 'warn':
    case 'error':
      return `echo "${getTabs(this.options.transpiler.tabs)}${this.options.variable}"`
    case 'count':
      return this.handleCount()
    case 'countReset':
      return this.resetCount()
    case 'group': {
      this.options.transpiler.tabs = this.options.transpiler.tabs + 1
      return ''
    }
    case 'groupCollapsed': {
      this.options.transpiler.tabs = this.options.transpiler.tabs + 1
      return ''
    }
    case 'groupEnd': {
      this.options.transpiler.tabs = this.options.transpiler.tabs - 1
      return ''
    }
    case 'time':
      return this.time()
    case 'timeEnd':
      return this.timeEnd()
    default:
      return 'echo "Unknown console method:"'
    }
  }
  
  /**
   * Altera o valor do count acrescentando +1
   *
   * @returns {string}
   */
  handleCount(): string {
    const code: string[] = []
    const variable = this.options.variable || 'default'

    code.push(`((count_${variable}++))`)
    code.push(`echo "${getTabs(this.options.transpiler.tabs)}${variable}: $count_${variable}"`)

    return breakLines(code)
  }
  
  /**
   * Reseta um Count setando-o como 0
   *
   * @returns {string}
   */
  resetCount (): string {
    const code: string[] = []
    const variable = this.options.variable || 'default'

    code.push(`((count_${variable}=0))`)
    code.push(`echo "${getTabs(this.options.transpiler.tabs)}${variable}: $count_${variable}"`)

    return breakLines(code)
  }

  
  /**
   * Seta de forma global a variavel onde se inicializa o timer
   *
   * Input: console.count('teste')
   * 
   * Output: ((start_time_teste=$(date +%s%N)))
   * @returns {string}
   */
  time (): string {
    const variable = this.options.variable || 'default'

    return `((start_time_${variable}=$(date +%s%N)))`
  }
  
  /**
   * Faz o calculo do tempo da inicialização em ms
   * 
   * Input: console.time('test')
   * 
   * Output:
   * ((end_time_test=$(date +%s%N)))
   * echo "$((($end_time_test-start_time_test)/1000000)) ms"
   *
   * @returns {string}
   */
  timeEnd (): string {
    const code: string[] = []
    const variable = this.options.variable || 'default'

    code.push(`((end_time_${variable}=$(date +%s%N)))`)
    code.push(`echo "${getTabs(this.options.transpiler.tabs)}${variable}: $((($end_time_${variable}-start_time_${variable})/1000000)) ms"`)
    
    return breakLines(code)
  }
}