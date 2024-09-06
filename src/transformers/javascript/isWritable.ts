import { access, constants } from 'fs/promises'

/**
 * Valida se há permissão de escrita.
 *
 * @async
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const isWritable = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.W_OK)
    return true
  } catch {
    return false
  }
}
global.isWritable = isWritable
export { isWritable }