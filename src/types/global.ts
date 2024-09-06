/* eslint-disable no-var */
import * as utils from '@/transformers/index.js'

declare global {
  var isDir: typeof utils.isDir
  var isEmpty: typeof utils.isEmpty
  var isExecutable: typeof utils.isExecutable
  var isFile: typeof utils.isFile
  var isNumber: typeof utils.isNumber
  var isReadable: typeof utils.isReadable
  var isWritable: typeof utils.isWritable
  var isCommand: typeof utils.isCommand
  // var fetch: typeof utils.fetch
  interface globalThis {
    isDir: typeof utils.isDir
    isEmpty: typeof utils.isEmpty
    isExecutable: typeof utils.isExecutable
    isFile: typeof utils.isFile
    isNumber: typeof utils.isNumber
    isReadable: typeof utils.isReadable
    isWritable: typeof utils.isWritable
    isCommand: typeof utils.isCommand
    fetch: typeof utils.fetchNew
  }
}