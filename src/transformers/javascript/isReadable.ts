import { access, constants } from 'fs/promises'

global.isReadable = async (path: string) => {
  try {
    await access(path, constants.R_OK)
    return true
  } catch {
    return false
  }
}