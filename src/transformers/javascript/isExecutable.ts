import { access, constants } from 'fs/promises'

global.isExecutable = async (path: string) => {
  try {
    await access(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}
export {}
