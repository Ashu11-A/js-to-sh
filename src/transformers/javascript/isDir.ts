import { stat } from 'fs/promises'

const isDir = async (path: string) => {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

global.isDir = isDir
export { isDir }