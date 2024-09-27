import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const typesPath = join(process.cwd(), 'dist/types/index.d.ts')
let code = await readFile(typesPath, { encoding: 'utf-8' })

const global =`
declare global {
    const isDir: typeof isDir$1
    const isEmpty: typeof isEmpty$1
    const isExecutable: typeof isExecutable$1
    const isFile: typeof isFile$1
    const isNumber: typeof isNumber$1
    const isReadable: typeof isReadable$1
    const isWritable: typeof isWritable$1
    const isCommand: typeof isCommand$1
    interface globalThis {
        isDir: typeof isDir$1;
        isEmpty: typeof isEmpty$1;
        isExecutable: typeof isExecutable$1;
        isFile: typeof isFile$1;
        isNumber: typeof isNumber$1;
        isReadable: typeof isReadable$1;
        isWritable: typeof isWritable$1;
        isCommand: typeof isCommand$1;
        fetch: typeof fetchNew;
    }
}
`

code += global

await writeFile(typesPath, code)