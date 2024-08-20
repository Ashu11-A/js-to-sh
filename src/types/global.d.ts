/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
declare var isDir: (path: string) => Promise<boolean>
declare var isEmpty: (content: any) => boolean
declare var isExecutable: (path: string) => Promise<boolean>
declare var isFile: (path: string) => Promise<boolean>
declare var isNumber: (num: any) => boolean
declare var isReadable: (path: string) => Promise<boolean>
declare var isWritable: (path: string) => Promise<boolean>