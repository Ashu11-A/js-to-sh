/* eslint-disable @typescript-eslint/no-explicit-any */

declare function isDir (path: string): Promise<boolean>
declare function isEmpty (content: any): boolean
declare function isExecutable (path: string): Promise<boolean>
declare function isFile (path: string): Promise<boolean>
declare function isNumber (num: any): boolean
declare function isReadable (path: string): Promise<boolean>
declare function isWritable (path: string): Promise<boolean>