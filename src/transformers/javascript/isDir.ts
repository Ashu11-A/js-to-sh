import { stat } from 'fs/promises'

global.isDir = async (path: string) => {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}
export {}