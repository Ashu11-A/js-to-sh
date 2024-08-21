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