import { access, constants } from 'fs/promises'

export async function isWritable (path: string) {
  try {
    await access(path, constants.W_OK)
    return true
  } catch {
    return false
  }
}