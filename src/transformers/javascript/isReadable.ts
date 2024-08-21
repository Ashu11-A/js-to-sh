import { access, constants } from 'fs/promises'

const isReadable = async (path: string) => {
  try {
    await access(path, constants.R_OK)
    return true
  } catch {
    return false
  }
}
global.isReadable = isReadable
export { isReadable }