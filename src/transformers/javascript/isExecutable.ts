import { access, constants } from 'fs/promises'

const isExecutable = async (path: string) => {
  try {
    await access(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}
global.isExecutable = isExecutable
export { isExecutable }
