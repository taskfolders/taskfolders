import { join } from 'path/posix'
import * as fs from 'fs'
import { StandardMetadata } from '../StandardMetadata.js'
import { TimeMarker } from '@taskfolders/utils/native/date/TimeMarker'
import { TimeMark } from '../TimeMark.js'
import { SectionSummary } from '../scan/parseMarkdownSections.js'

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

export type FlagKey =
  | 'skip'
  | 'todo'
  | 'waiting'
  | 'now'
  | 'now-dir'
  | 'tasks-dir'
  | 'waiting-dir'
  | 'workspace'
  | 'workspace-global'

export class PathItem {
  wsName: any
  // pathRelative
  get pathFull() {
    return join(this.base, this.path)
  }
  workspace: {
    name: string
    dir: string
  }

  uid?: string
  sid?: string
  done?: boolean

  /** @deprecated */
  path: string
  get pathRelative(): string {
    return this.path
  }

  dir

  /** @deprecated */
  base
  before: Date
  /** @deprecated */
  after: Date
  after_v2?: TimeMark
  tags: string[] = []
  flags: FlagKey[] = []
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

  constructor(kv: { pathRelative: string; after?: Date }) {
    // TODO no guess .?
    this.path = kv?.pathRelative
    this.after = kv?.after
  }

  sections: SectionSummary[] = [];

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return `<${this.constructor.name} {${this.wsName}}:${this.path}>`
  }
}
