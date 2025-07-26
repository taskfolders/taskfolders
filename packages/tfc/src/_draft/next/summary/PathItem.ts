import { join } from 'path/posix'
import * as fs from 'fs'
import { StandardMetadata } from '../StandardMetadata.js'
import { TimeMarker } from '@taskfolders/utils/native/date/TimeMarker'
import { TimeMark } from '../TimeMark.js'
import { SectionSummary } from '../scan/parseMarkdownSections.js'
import { cacheResult } from './cacheResult.js'

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
  _fs = fs

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
  focus?: TimeMark

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
    return this._fs.statSync(this.pathFull)
  }

  @cacheResult
  get inode() {
    return this._stat.ino
  }

  constructor(kv: { pathRelative: string; after?: Date; base?: string }) {
    // TODO no guess .?
    this.path = kv?.pathRelative
    this.base = kv.base
    this.after = kv?.after
  }

  issues: any[] = []
  sections: SectionSummary[] = [];

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let path = `${this.wsName}:${this.path}`
    let issues = this.issues.length ? '+issues' : ''
    let parts = [path, issues].filter(Boolean).join(' ')
    return `<${this.constructor.name} ${parts}>`
  }
}
