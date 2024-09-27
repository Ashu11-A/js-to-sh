import { readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { getMethods } from './methods.js'
import { watch } from 'chokidar'

const methodsMap = new Map<string, boolean>()
const running = new Map<string, boolean>()
const pathMethods = join(process.cwd(), 'src/methods')
const watcher = watch(pathMethods)
const files: string[] = []

const generate = async () => {
  const codePath = join(process.cwd(),'src/types/methods.ts')
  const importPath = 'src/index.ts'

  const regex = /\/\* Start Generate By Build \*\/[\s\S]*?\/\* End Generate By Build \*\//g

  const codeType = await readFile(codePath, 'utf8')
  const codeImports = await readFile(importPath, 'utf8')

  const methods = Array.from(methodsMap.keys())
  const imports: string[] = []

  for (const file of files) {
    imports.push(`import './${file.replace(`${process.cwd()}/src/`, '')}'`)
  }
  
  const newCodeType = codeType.replace(
    regex,
    `/* Start Generate By Build */
export type ExistsMethods = ASTMap[${methods.map((method) => `'${method}'`).join(' | ')}]['type']
/* End Generate By Build */`
  )

  const newCodeImport = codeImports.replace(
    regex,
    `/* Start Generate By Build */
${imports.join('\n')}
/* End Generate By Build */`
  )

  await writeFile(codePath, newCodeType, { encoding: 'utf-8' })
  await writeFile(importPath, newCodeImport, { encoding: 'utf-8' })
}

const updateMethodsMap = async (file: string) => {
  try {
    const methods = await getMethods(file)
    methods.forEach((method) => methodsMap.set(method, true))
  } catch (error) {
    console.error(`Error processing methods in file ${file}:`, error)
  }
}

watcher.once('ready', async () => {
  for (const [path, arquives] of Object.entries(watcher.getWatched())) {
    for (const file of arquives) {
      const pathFile = join(path, file)
      if (file.endsWith('.ts') && (await stat(pathFile)).isFile()) {
        files.push(pathFile)
      }
    }
  }

  console.log(`📦 Watching ${files.length} files...\n`)

  for (const file of files) {
    await updateMethodsMap(file)
  }
  
  await generate()
})
watcher.on('change', async (_event, file) => {
  if (typeof file !== 'string') return
  if (running.get(file) !== undefined) return

  running.set(file, true)

  console.time(file)
  await updateMethodsMap(file)
  await generate()
  console.timeEnd(file)
  console.log(`🔄 File changed: ${file}`)
    
  setTimeout(() => running.delete(file), 2000)
})