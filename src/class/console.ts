interface ConsoleOptions {
    methodName: string
    args?: string
}

export class Console {
  private readonly options: ConsoleOptions
  constructor (options: ConsoleOptions) {
    this.options = options
  }

  parse (): string {
    const shellCommand = this.map()

    return `${shellCommand} ${this.options.args ?? ''}`
  }

  map () {
    switch (this.options.methodName) {
    case 'clear':
      return 'clear'
    case 'debug':
    case 'log':
    case 'info':
    case 'warn':
    case 'error':
      return 'echo'
    default:
      return 'echo "Unknown console method:"'
    }
  }
}