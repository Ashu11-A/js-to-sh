import { Colors } from '@loggings/beta'
import { readFileSync } from 'fs'
import { globSync } from 'glob'
import { basename, dirname, extname, join } from 'path'
import { fileURLToPath } from 'url'

const rootFile = basename(fileURLToPath(import.meta.url))
const rootPath = dirname(fileURLToPath(import.meta.url))
export const getTransformers = () => rootFile === 'index.js'
  ? globSync(join(rootPath, '..', 'transformers/**/*.sh'), { cwd: join('..', rootPath) })
  : globSync('src/transformers/shellscript/**/*.sh', { cwd: process.cwd() })

export const getTransformer = (transformer: string) => {
  const files = new Map<string, string>()

  if (rootFile === 'index.js') {
    globSync(join(rootPath, '..', 'transformers/**/*.sh'), { cwd: join('..', rootPath) })
      .forEach((filePath) => files.set(basename(filePath, extname(filePath)), filePath))
  } else {
    globSync('src/transformers/shellscript/**/*.sh', { cwd: process.cwd() })
      .forEach((filePath) => files.set(basename(filePath, extname(filePath)), filePath))
  }

  const filePath = files.get(transformer)
  if (filePath) return readFileSync(filePath, { encoding: 'utf8' })
  console.debug(Colors('red', `Transformer ${transformer} not found!`))
  return ''
}