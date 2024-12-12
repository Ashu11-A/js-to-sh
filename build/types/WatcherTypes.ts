import type { Watcher } from '../class/Watcher.js'

/**
 * Enum representing the types of watchers.
 */
export enum WatcherTypes {
  Import = 'Import',
  Method = 'Method'
}

/**
 * Interface defining the possible events emitted by the watcher.
 */
export type WatcherEvents = {
  completed: undefined
  ready: string
  change: string
}

/**
 * Schema for the base watcher configuration.
 */
export type WatcherSchema = {
  /** Path to the main file being watched. */
  targetFile: string
  /** Optional array of file extensions to watch. */
  fileExtensions?: string[]
  /** Path to the directory being watched. */
  watchDirectory: string
}

/**
 * Configuration for a watcher handling method-related changes.
 */
export type WatcherMethod<WatcherTyper extends WatcherTypes> = {
  type: WatcherTypes.Method
  /** Name of the method being tracked. */
  methodName: string
  /** Type of the method (type or interface). */
  methodType: 'type' | 'interface'
  /**
   * Function to generate a list of methods.
   * @param interaction The interaction details.
   * @param watcher The watcher instance excluding interaction.
   * @returns A promise resolving to a list of methods.
   */
  setMethods: (interaction: Watcher<WatcherTyper>['interaction'], watcher: Omit<Watcher<WatcherTyper>, 'interaction'>) => Promise<string[]>
  /**
   * Function to generate code based on methods.
   * @param interaction The interaction details.
   * @param methods The list of methods to use.
   * @returns The generated code.
   */
  setCode: (interaction: Watcher<WatcherTyper>['interaction'], methods: string[]) => string
}

/**
 * Configuration for a watcher handling import-related changes.
 */
export type WatcherImport<WatcherTyper extends WatcherTypes> = {
  type: WatcherTypes.Import
  /**
   * Optional function to set imports.
   * @param options The interaction options excluding setImports.
   * @returns A list of imports or a single import string.
   */
  setImports?: (options: Omit<Watcher<WatcherTyper>['interaction'], 'setImports'>) => string[] | string
}

/**
 * Properties required for a watcher instance.
 */
export type WatcherProps<WatcherTyper extends WatcherTypes> = WatcherSchema & (
  WatcherTyper extends WatcherTypes.Method
  ? WatcherMethod<WatcherTyper>
  : WatcherImport<WatcherTyper>
)