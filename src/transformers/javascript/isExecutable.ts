import { access, constants } from 'fs/promises'

/**
 * Valida se o arquivo tem permissão de execução.
 *
 * @async
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
const isExecutable = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, constants.X_OK)
    return true
  } catch {
    return false
  }
}
global.isExecutable = isExecutable
export { isExecutable }
