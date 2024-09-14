import { rename } from 'fs/promises'
import { glob } from 'glob'
import { build } from 'tsup'

await build({
  platform: 'node',
  format: 'cjs',
  entry: ['src/**/*.ts'],
  outDir: 'dist/cjs',
  tsconfig: './tsconfig.cjs.json',
  bundle: false,
  skipNodeModulesBundle: true,
  splitting: false,
  clean: true,
  dts: false
})

const files = await glob('dist/**/*.cjs', { cwd: process.cwd() })

for (const filename of files) {
  const newName = filename.replace('.cjs', '.js')
  await rename(filename, newName)
}