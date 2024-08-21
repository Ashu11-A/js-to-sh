import { access, constants } from 'fs/promises'

global.isWritable = async (path: string) => {
  try {
    await access(path, constants.W_OK)
    return true
  } catch {
    return false
  }
}