import { FSWatcher, watch } from 'chokidar'
import EventEmitter from 'events'
import { readFile, stat, writeFile } from 'fs/promises'
import { dirname, join, relative, resolve } from 'path'
import { WatcherTypes, type WatcherEvents, type WatcherProps } from '../types/WatcherTypes.js'

/**
 * Class representing a file watcher with custom behaviors for imports or methods.
 * @template WatcherTyper The type of watcher (Import or Method).
 */
export class Watcher<WatcherTyper extends WatcherTypes> extends EventEmitter {
  /** Set of files being processed. */
  private running = new Set<string>()
  /** Set of files being watched. */
  private files = new Set<string>()
  /** Instance of the file system watcher. */
  public watcher: FSWatcher

  /**
   * Creates an instance of the Watcher class.
   * @param interaction The interaction details and configuration.
   */
  constructor(public interaction: WatcherProps<WatcherTyper>) {
    super()
    this.watcher = watch(this.interaction.watchDirectory) as unknown as FSWatcher
    this.setupListeners()
    this.setupRunner()
  }

  /**
   * Adds an event listener for a watcher event.
   * @param event The event type.
   * @param listener The callback function for the event.
   * @returns The Watcher instance for chaining.
   */
  public on<Event extends keyof WatcherEvents>(
    event: Event,
    listener: (arg: WatcherEvents[Event]) => void
  ): this {
    return super.on(event, listener)
  }

  /**
   * Emits a watcher event.
   * @param event The event type.
   * @param arg The argument for the event listener.
   * @returns Whether the event had listeners.
   */
  public emit<Event extends keyof WatcherEvents>(
    event: Event,
    arg: WatcherEvents[Event]
  ): boolean {
    return super.emit(event, arg)
  }

  /** Sets up file watcher listeners. */
  private setupListeners() {
    this.watcher.on('change', async (filePath) => this.handleFileChange(filePath))
    this.watcher.on('ready', async () => this.handleReady())
  }

  /** Sets up runners for processing events. */
  private async setupRunner() {
    this.on('ready', (filePath: string) => this.files.add(filePath))
    this.on('change', (filePath) => this.files.add(filePath))

    this.once('completed', async () => {
      let fileContent = (await readFile(this.interaction.targetFile, { encoding: 'utf-8' })).split('\n')
      console.log(`[${this.interaction.type}] 📦 Watching ${this.files.size} files...`)

      switch (this.interaction.type) {
      case WatcherTypes.Import: {
        // Process file imports
        const path = dirname(this.interaction.targetFile)
        const files = Array.from(this.files.values()).sort((a, b) => b.localeCompare(a))

        files.forEach((filePath) => {
          const locale = resolve(path)
          const localeFile = relative(locale, filePath)
          fileContent = fileContent
            .map((content) => content.includes(localeFile) ? undefined : content)
            .filter((content) => content !== undefined)
          fileContent.push(`import '${localeFile.startsWith('.') ? localeFile : `./${localeFile}`}'`)
        })

        await writeFile(this.interaction.targetFile, fileContent.reverse().join('\n'), { encoding: 'utf-8' })
        break
      }
      case WatcherTypes.Method: {
        // Process method generation
        const methods = await this.interaction.setMethods(this.interaction, this as Watcher<WatcherTypes.Method>)
        const code = this.interaction.setCode(this.interaction, methods)
        const types = `${this.interaction.methodType} ${this.interaction.methodName}`.trim()

        fileContent = fileContent.map((content) => (content.trim().includes(types) ? code : content))
        await writeFile(this.interaction.targetFile, fileContent.join('\n'), { encoding: 'utf-8' })
        break
      }
      }
    })
  }

  /**
   * Handles file change events.
   * @param filePath The path of the file that changed.
   */
  private async handleFileChange(filePath: string) {
    if (typeof filePath !== 'string' || this.running.has(filePath)) return
    this.running.add(filePath)
    this.emit('change', filePath)
    console.log(`[${this.interaction.type}] 🔄 File changed: ${filePath}`)

    setTimeout(() => this.running.delete(filePath), 2000)
  }

  /**
   * Handles the watcher being ready.
   */
  private async handleReady(): Promise<void> {
    const promises = []
    for (const [path, files] of Object.entries(this.watcher.getWatched())) {
      for (const file of files) {
        const filePath = join(path, file)
        const endsWith = this.interaction.fileExtensions

        if (
          (!endsWith || endsWith.some((end) => file.endsWith(end)))
          && (await stat(filePath)).isFile()
        ) {
          promises.push(Promise.resolve(this.emit('ready', filePath)))
        }
      }
    }
    await Promise.all(promises)
    this.emit('completed', undefined)
  }

  /**
     * Retrieves the list of watched files.
     * @returns A set of watched files.
     */
  public getFiles(): Set<string> {
    return this.files
  }

  /** Closes the watcher and cleans up resources. */
  public close(): void {
    this.watcher.close()
    console.log('Watcher stopped.')
  }
}
