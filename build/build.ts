import { rename } from 'fs/promises'
import { glob } from 'glob'
import { build } from 'tsup'

await build({
  platform: 'node',
  format: 'cjs',
  entry: ['src/index.ts'],
  outDir: 'dist/cjs',
  tsconfig: './tsconfig.cjs.json',
  bundle: true,
  shims: true,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
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

await build({
  platform: 'node',
  format: 'esm',
  entry: ['src/index.ts'],
  cjsInterop: false,
  outDir: 'dist/mjs',
  tsconfig: './tsconfig.mjs.json',
  bundle: true,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  skipNodeModulesBundle: true,
  splitting: true,
  clean: true,
  dts: false
})