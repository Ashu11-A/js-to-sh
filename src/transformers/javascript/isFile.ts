import { stat } from 'fs/promises'

/**
 * Valida se o path é um arquivo
 *
 * @async
 * @param {string} filePath
 * @returns {unknown}
 */
const isFile = async (filePath: string) => {
  try {
    return (await stat(filePath)).isFile()
  } catch {
    return false
  }
}
global.isFile = isFile
export { isFile }
