import { cp } from 'fs/promises'
import { build } from 'tsup'

await build({
  format: 'esm',
  entry: ['src/**/*.ts'],
  tsconfig: './tsconfig.build.json',
  bundle: false,
  platform: 'node',
  skipNodeModulesBundle: true,
  splitting: false,
  clean: true,
  dts: true,
  // minify: true
})

const path = 'src/transformers/shellscript'
await cp(path, path.replace('src', 'dist'), { recursive: true, preserveTimestamps: true })