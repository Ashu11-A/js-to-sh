import { access, constants } from 'fs/promises'

export async function isExecutable (path: string) {
  try {
    return (await access(path, constants.X_OK))
  } catch {
    return false
  }
}