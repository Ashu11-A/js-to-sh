import { access, constants } from 'fs/promises'

export async function isReadable (path: string) {
  try {
    return (await access(path, constants.R_OK))
  } catch {
    return false
  }
}