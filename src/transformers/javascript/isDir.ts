import { stat } from 'fs/promises'

export async function isDir(path: string) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}