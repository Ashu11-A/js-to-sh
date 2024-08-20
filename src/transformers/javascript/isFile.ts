import { stat } from 'fs/promises'

global.isFile = async (path: string) => {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}
export {}
