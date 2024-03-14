import * as FS from 'fs'
import { Stats } from 'node:fs'
import { relative } from 'node:path'
import { getsert } from './getsert.js'
import { MarkdownDocument } from '@taskfolders/utils/markdown'
import { IssueItem } from '@taskfolders/utils/issues'

/** ActiveRecord type File
 *
 * When you want just a list of of files by path, but have a smart, convenient
 * way to:
 *
 * JOBS
 * - cache and lazy run of fs operations
 * - list of issues
 *
 */
export class ActiveFile<T = unknown> {
  private _cache = {} as any

  data: T

  private _cwd
  set cwd(x: string) {
    this._cwd = x
    delete this._cache.pathRelative
  }
  get cwd() {
    return this._cwd
  }

  path: string
  _fs = FS

  /** @deprecated */
  md?: MarkdownDocument

  issues: IssueItem[] = []
  modified: boolean
  update?: { before; after }

  static list(all: Pick<ActiveFile, 'path'>[], kv: { fs: typeof FS }) {
    return all.map(x => ActiveFile.create({ ...x, ...kv }))
  }

  static create(kv: Pick<ActiveFile, 'path'> & Partial<{ fs: typeof FS }>) {
    let obj = new this()
    obj.path = kv.path
    obj._fs = kv.fs
    return obj
  }

  get pathRelative() {
    if (!this._cwd) return null
    return getsert(this._cache, 'pathRelative', () => {
      let p = relative(this.cwd, this.path)
      return p
    })
  }
  get path_r() {
    return this.pathRelative
  }

  get buffer(): Buffer {
    return getsert(this._cache, 'buffer', () => {
      return this._fs.readFileSync(this.path)
    })
  }

  get body() {
    return this.buffer.toString()
  }

  set body(txt: string) {
    this._cache.buffer = Buffer.from(txt)
    this.modified = true
  }

  get json() {
    return getsert(this._cache, 'json', () => {
      let res
      try {
        res = JSON.parse(this.body)
      } catch (e) {
        let error = new Error('Invalid JSON')
        error.cause = e
        error.name = 'JsonError'
        // @ts-expect-error TODO
        error.data = { path: this.path }
        throw error
      }
      return res
    })
  }

  get stat(): Stats {
    return getsert(this._cache, 'stat', () => {
      return this._fs.statSync(this.path)
    })
  }

  read() {
    return this._fs.readFileSync(this.path)
  }

  write(text: string, kv: never)
  write(obj: Object, kv?: { pretty?: boolean })
  write(thing, kv) {
    let body: string
    if (typeof thing === 'string') {
      body = thing
    } else {
      if (kv.pretty) {
        body = JSON.stringify(thing, null, 2)
      } else {
        body = JSON.stringify(thing)
      }
    }

    return this._fs.writeFileSync(this.path, body)
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    let parts = [this.path]
    if (this.issues?.length) {
      parts.push('+issues')
    }
    return `<${this.constructor.name} ${parts.join(' ')}>`
  }
}
