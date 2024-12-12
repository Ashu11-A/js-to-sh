import { join } from 'path'
import { Watcher, WatcherTypes } from './class/watcher.js'
import { TypeExtractor } from './lib/extractTypes.js'
import { ASTAnalyzer } from './class/methods.js'

new Watcher({ 
  type: WatcherTypes.Import,
  filePath: join(process.cwd(), 'src/index.ts'),
  watcherPath: join(process.cwd(), 'src/methods'),
  endsWith: ['.ts']
})

new Watcher({ 
  type: WatcherTypes.Method,
  filePath: join(process.cwd(), 'src/types/methods.ts'),
  watcherPath: join(process.cwd(), 'src/methods'),
  methodName: 'ExistsMethods',
  methodType: 'type',
  endsWith: ['.ts'],
  async setMethods(_interaction, watcher) {
    const files = Array.from(watcher.getFiles().values())
    const methods = new Set<string>()

    for (const filePath of files) {
      try {
        const typeExtractor = new TypeExtractor(join(process.cwd(), 'src/types/methods.ts'), 'ASTMap')
        const analyzer = new ASTAnalyzer(typeExtractor)
        const methodNames = (await analyzer.analyzeFile(filePath)).sort((a, b) => b.localeCompare(a))

        methodNames.forEach((method) => methods.add(method))
      } catch (error) {
        if (error instanceof Error) console.log(`[Error]: ${error.message}`)
      }

    }

    return Array.from(methods.values())
  },
  setCode(interaction, methods) {
    return `export ${interaction.methodType} ${interaction.methodName} = ASTMap[${methods.map((method) => `'${method}'`).join(' | ')}]['type']`
  }
})