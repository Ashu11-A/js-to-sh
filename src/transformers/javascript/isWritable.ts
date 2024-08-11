import { access, constants } from 'fs/promises'

export async function isWritable (path: string) {
  try {
    return (await access(path, constants.W_OK))
  } catch {
    return false
  }
}