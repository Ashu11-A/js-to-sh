import { exec as execSync } from 'child_process'
import { promisify } from 'util'


/**
 * Usado para validar se existe um certo tipo de comando existe no sistema operacional onde o script está rodando
 *
 * @async
 * @param {string} command
 * @returns {Promise<boolean>}
 */
const isCommand = async (command: string): Promise<boolean> => {
  try {
    const exec = promisify(execSync)
    const { stdout } = await exec(`command -v ${command}`)
    if (stdout.length !== 0) {
      return true
    }
    return false
  } catch {
    return false
  }
}

global.isCommand = isCommand
export { isCommand }
