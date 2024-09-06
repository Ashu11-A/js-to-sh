import { stat } from 'fs/promises'

/**
 * Verifica se o path é um diretório
 *
 * @async
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const isDir = async (path: string): Promise<boolean> => {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

global.isDir = isDir
export { isDir }