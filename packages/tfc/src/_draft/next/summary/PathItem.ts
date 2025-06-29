import { join } from 'path/posix'
import * as fs from 'fs'
import { StandardMetadata } from '../StandardMetadata.js'

function cacheResult(...args) {
  let [fn, ctx] = args
  let cacheKey = '__cache__' + fn.name
  // console.log('in log call', ctx)
  // Object.defineProperty(ctx.metadata, cacheKey, { enumerable: false })

  return function (...args) {
    // console.log(`Calling ${fn.name} with arguments:`, args)
    if (!this[cacheKey]) {
      Object.defineProperty(this, cacheKey, {
        enumerable: false,
        writable: true,
      })
      const result = fn.apply(this, args)
      this[cacheKey] = result
      // console.log(`Returned:`, result)
    }
    return this[cacheKey]
  }
}
export class PathItem {
  // pathRelative
  get pathFull() {
    return join(this.base, this.path)
  }
  uid?: string
  sid?: string
  path
  dir
  show
  base
  before: Date
  after: Date
  tags: string[] = []
  flags: string[] = []
  review: StandardMetadata['review']

  @cacheResult
  get mtime(): Date {
    return this._stat.mtime
  }

  @cacheResult
  get _stat() {
    return fs.statSync(this.pathFull)
  }

  @cacheResult
  get inode() {
    return this._stat.ino
  }

  sections = [];
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} ${this.path}>`
  }
}
