import { FSWatcher, watch } from 'chokidar'
import EventEmitter from 'events'
import { readFile, stat, writeFile } from 'fs/promises'
import { dirname, join, relative, resolve } from 'path'

export enum WatcherTypes {
    Import = 'Import',
    Method = 'Method'
}
  
export type WatcherEvents = {
    completed: undefined
    ready: string
    change: string
}

export type WatcherSchema = {
    filePath: string
    endsWith?: string[]
    watcherPath: string
}

export type WatcherMethod<WatcherTyper extends WatcherTypes> = {
    type: WatcherTypes.Method
    methodName: string
    methodType: 'type' | 'interface'
    setMethods: (interaction: Watcher<WatcherTyper>['interaction'], watcher: Omit<Watcher<WatcherTyper>, 'interaction'>) => Promise<string[]>
    setCode: (interaction: Watcher<WatcherTyper>['interaction'], methods: string[]) => string
}

export type WatcherImport<WatcherTyper extends WatcherTypes> = {
    type: WatcherTypes.Import
    setImports?: (options: Omit<Watcher<WatcherTyper>['interaction'], 'setImports'>) => string[] | string
}

export type WatcherProps<WatcherTyper extends WatcherTypes> = WatcherSchema & (
    WatcherTyper extends WatcherTypes.Method
    ? WatcherMethod<WatcherTyper>
    : WatcherImport<WatcherTyper>
)
  
export class Watcher<WatcherTyper extends WatcherTypes> extends EventEmitter {
  private running = new Set<string>()
  private files = new Set<string>()
  public watcher: FSWatcher
  
  constructor (public interaction: WatcherProps<WatcherTyper>) {
    super()
    this.watcher = watch(this.interaction.watcherPath) as unknown as FSWatcher
    this.setupListeners()
    this.setupRunner()
  }
  
  public on<Event extends keyof WatcherEvents>(
    event: Event,
    listener: (arg: WatcherEvents[Event]) => void
  ): this {
    return super.on(event, listener)
  }
  public emit<Event extends keyof WatcherEvents>(
    event: Event,
    arg: WatcherEvents[Event]
  ): boolean {
    return super.emit(event, arg)
  }
  
  private setupListeners () {
    this.watcher.on('change', async (filePath) => this.handleFileChange(filePath))
    this.watcher.on('ready', async () => this.handleReady())
  }
  
  private async setupRunner () {
    this.on('ready', (filePath: string) => this.files.add(filePath))
    this.on('change', (filePath) => this.files.add(filePath))
      
    this.once('completed', async () => {
      let fileContent = (await readFile(this.interaction.filePath, { encoding: 'utf-8' })).split('\n')
      console.log(`[${this.interaction.type}] 📦 Watching ${this.files.size} files...`)
  
      switch (this.interaction.type) {
      case WatcherTypes.Import: {
        const path = dirname(this.interaction.filePath)
        const files = Array.from(this.files.values()).sort((a, b) => b.localeCompare(a))
  
        files.forEach((filePath) => {
          const locale = resolve(path)
          const localeFile = relative(locale, filePath)
  
          filePath = filePath.replace(path, '')
          fileContent = fileContent.map((content) => content.includes(localeFile) ? undefined : content).filter((content) => content !== undefined)
          fileContent.push(`import '${localeFile.startsWith('.') ? localeFile : `./${localeFile}`}'`)
        })
  
        await writeFile(this.interaction.filePath, fileContent.reverse().join('\n'), { encoding: 'utf-8' })
        break
      }
      case WatcherTypes.Method: {
        const methods = await this.interaction.setMethods(this.interaction, this as Watcher<WatcherTypes.Method>)
        const code = this.interaction.setCode(this.interaction, methods)
        const types = `${this.interaction.methodType} ${this.interaction.methodName}`.trim()
  
        fileContent = fileContent.map((content) => (content.trim().includes(types) ? code : content))
        await writeFile(this.interaction.filePath, fileContent.join('\n'), { encoding: 'utf-8',  })
        break
      }
      }
    })
  }
  
  private async handleFileChange (filePath: string) {
    if (typeof filePath !== 'string' || this.running.has(filePath)) return
    
    this.running.add(filePath)
    this.emit('change', filePath)
    
    console.log(`[${this.interaction.type}] 🔄 File changed: ${filePath}`)

    setTimeout(() => this.running.delete(filePath), 2000)
  }
  
  private async handleReady (): Promise<void> {
    const promises = []
    for (const [path, files] of Object.entries(this.watcher.getWatched())) {
      for (const file of files) {
        const filePath = join(path, file)
        const endsWith = this.interaction.endsWith
    
        if (
          (!endsWith || endsWith.some((end) => file.endsWith(end))) &&
            (await stat(filePath)).isFile()
        ) {
          promises.push(Promise.resolve(this.emit('ready', filePath)))
        }
      }
    }
    await Promise.all(promises)
    this.emit('completed', undefined)
  }
  
  public getFiles () {
    return this.files
  }
    
  public close(): void {
    this.watcher.close()
    console.log('Watcher stopped.')
  }
}