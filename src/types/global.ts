/* eslint-disable no-var */
 
import * as utils from '@/transformers/index.js'

Object.assign(globalThis, utils)

declare global {
  var isDir: typeof utils.isDir
  var isEmpty: typeof utils.isEmpty
  var isExecutable: typeof utils.isExecutable
  var isFile: typeof utils.isFile
  var isNumber: typeof utils.isNumber
  var isReadable: typeof utils.isReadable
  var isWritable: typeof utils.isWritable
  var isCommand: typeof utils.isCommand
  var fetchShell: typeof utils.fetch
}