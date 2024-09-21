import { globSync } from 'glob'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const rootFile = basename(fileURLToPath(import.meta.url))
const rootPath = dirname(fileURLToPath(import.meta.url))
export const getTransformers = () => rootFile === 'index.js'
  ? globSync(join(rootPath, '..', 'transformers/**/*.sh'), { cwd: join('..', rootPath) })
  : globSync('src/transformers/shellscript/**/*.sh', { cwd: process.cwd() })
