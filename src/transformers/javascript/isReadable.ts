import { access, constants } from 'fs/promises'

/**
 * Valida se há permissão de leitura.
 *
 * @async
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const isReadable = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.R_OK)
    return true
  } catch {
    return false
  }
}
global.isReadable = isReadable
export { isReadable }