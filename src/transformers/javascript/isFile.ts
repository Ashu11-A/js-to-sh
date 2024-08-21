import { stat } from 'fs/promises'

const isFile = async (path: string) => {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}
global.isFile = isFile
export { isFile }
