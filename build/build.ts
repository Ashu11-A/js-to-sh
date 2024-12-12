import { dirname, join } from 'path'
import { build, type Options } from 'tsup'
import { ASTAnalyzer } from './class/ASTAnalyzer.js'
import { Watcher } from './class/Watcher.js'
import { TypeExtractor } from './lib/TypeExtractor.js'
import { WatcherTypes } from './types/WatcherTypes.js'
import { generateDtsBundle } from 'dts-bundle-generator'
import { cp, mkdir, writeFile } from 'fs/promises'

const activeProcesses = new Map<string, NodeJS.Timeout>()

const setProcessTimeout = (key: string, duration: number, callback: () => void) => {
  if (activeProcesses.has(key)) {
    clearTimeout(activeProcesses.get(key))
  }
  const timeout = setTimeout(() => {
    activeProcesses.delete(key)
    callback()
  }, duration)
  activeProcesses.set(key, timeout)
}

const initializeWatcher = () => {
  new Watcher({ 
    type: WatcherTypes.Import,
    targetFile: join(process.cwd(), 'src/index.ts'),
    watchDirectory: join(process.cwd(), 'src/methods'),
    fileExtensions: ['.ts']
  }).on('completed', async () => {
    setProcessTimeout('build', 2000, async () => await executeBuildProcess())
  })

  new Watcher({ 
    type: WatcherTypes.Method,
    targetFile: join(process.cwd(), 'src/types/methods.ts'),
    watchDirectory: join(process.cwd(), 'src/methods'),
    methodName: 'ExistingMethods',
    methodType: 'type',
    fileExtensions: ['.ts'],
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
          if (error instanceof Error) console.error(`[Error]: ${error.message}`)
        }
      }

      return Array.from(methods.values())
    },
    setCode(interaction, methods) {
      return `export ${interaction.methodType} ${interaction.methodName} = ASTMap[${methods.map((method) => `'${method}'`).join(' | ')}]['type']`
    }
  }).on('completed', async () => {
    setProcessTimeout('build', 2000, async () => await executeBuildProcess())
  })
}

const executeBuildProcess = async () => {
  const sharedConfig: Options = {
    bundle: true,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    skipNodeModulesBundle: true,
    clean: true,
    dts: false
  }

  await build({
    platform: 'node',
    format: 'cjs',
    entry: ['src/index.ts'],
    outDir: 'dist/cjs',
    tsconfig: './tsconfig.cjs.json',
    splitting: false,
    shims: true,
    ...sharedConfig
  })

  await build({
    platform: 'node',
    format: 'esm',
    entry: ['src/index.ts'],
    cjsInterop: false,
    outDir: 'dist/mjs',
    tsconfig: './tsconfig.mjs.json',
    splitting: true,
    ...sharedConfig
  })

  await writeFile('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }, null, 2))
  await writeFile('dist/mjs/package.json', JSON.stringify({ type: 'module' }, null, 2))

  const dtsPath = join(process.cwd(), 'dist/types/index.d.ts')
  const dtsCode = generateDtsBundle([{
    filePath: join(process.cwd(), 'src/index.ts'),
    libraries: {
      allowedTypesLibraries: ['meriyah'],
      importedLibraries: ['meriyah'],
      inlinedLibraries: ['meriyah']
    },
    output: {
      sortNodes: true,
      exportReferencedTypes: true,
      inlineDeclareExternals: true,
      inlineDeclareGlobals: true
    }
  }])

  await mkdir(dirname(dtsPath), { recursive: true })
  await writeFile(dtsPath, dtsCode, { encoding: 'utf-8' })

  await cp(join(process.cwd(), 'src/transformers/shellscript'), join(process.cwd(), 'dist/transformers'), { recursive: true })
}

initializeWatcher()
