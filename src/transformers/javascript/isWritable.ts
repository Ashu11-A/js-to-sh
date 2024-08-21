import { access, constants } from 'fs/promises'

const isWritable = async (path: string) => {
  try {
    await access(path, constants.W_OK)
    return true
  } catch {
    return false
  }
}
global.isWritable = isWritable
export { isWritable }