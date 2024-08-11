import { glob } from 'glob'
import { join } from 'path'
import { Transform } from './class/transform'

const files = await glob(['**/*.ts'], { cwd: join(process.cwd(), 'src/connects') })

for (const file of files) {
  const path = join(process.cwd(), 'src/connects', file)
  const transform = new Transform({ path })
  transform.parser(await transform.loader(path))
}