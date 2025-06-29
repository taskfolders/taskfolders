import * as fs from 'node:fs'
import { PathItem } from './summary/PathItem.js'
import { join } from 'path/posix'
import { cleanObjectCopy } from './cleanObject.js'

export type PathIndex = {
  sid?: any
  uid?: any
  after?: Date
  before?: Date
  tags?: string[]
  flags?: string[]
  review?: { next; latest? }
  scanTime?
  sections: { uid?; sid?; lineText? }[]
  calendar?: any[]

  // TODO future , not used in data.paths
  pathRelative?
}
export class WorkspaceIndex {
  _index = { uids: {} }
  pathIndexFile: string
  pathBaseDir: string
  timestamp = new Date()
  fs = fs

  data = {
    type: 'draft/workspace-index/1',
    version: 1,
    paths: {},
    paths_v2: {},
    items: [],
  } as {
    type: string
    version: number
    paths_v2: Record<string, PathItem>
    /** @deprecated */
    paths: Record<string, PathIndex>
    items: PathIndex[]
  }

  get(path: string) {
    let file = new PathItem()
    file.path = path
    file.base = this.pathBaseDir
    let found = this.data.paths[path] ?? {}
    // TODO
    // Object.assign(file, found)
    return file
    console.log(found)
  }

  _createItem(path: string) {
    let file = new PathItem()
    file.path = path
    file.base = this.pathBaseDir
    let found = this.data.paths[path] ?? {}
    //Object.assign(file, found)
    for (let key in Object.keys(found)) {
      file[key] = found[key]
    }
    return file
    console.log(found)
  }

  constructor(kv: { path }) {
    this.pathIndexFile = kv.path

    // TODO
    Object.defineProperty(this.data, 'paths_v2', { enumerable: false })
  }

  static fromJSON(body: string, kv: { path }) {
    let index = new WorkspaceIndex({ path: kv.path })
    index.loadJSON(body)

    return index
  }

  loadJSON(doc: string) {
    this.data = JSON.parse(doc)
    Object.values(this.data.paths).forEach(x => {
      x.sections ??= []
      if (x.after) {
        x.after = new Date(x.after)
      }
      if (x.before) {
        x.before = new Date(x.before)
      }
    })

    Object.values(this.data.items).forEach(x => {
      x.sections ??= []
      if (x.after) {
        x.after = new Date(x.after)
      }
      if (x.before) {
        x.before = new Date(x.before)
      }
    })
  }

  find(kv: { uid: string }): { path; type } {
    this._refreshIndex()
    return this._index.uids[kv.uid]
  }

  _refreshIndex() {
    for (let [key, val] of Object.entries(this.data.paths)) {
      if (val.uid) {
        this._index.uids[val.uid] = { path: key, type: 'path' }
      }
      for (let sec of val.sections) {
        if (sec.uid) {
          this._index.uids[sec.uid] = { path: key, type: 'section' }
        }
      }
    }
  }

  addFileSection(
    relPath: string,
    kv: { uid?: any; sid?: any; lineText?: string },
  ) {
    this.data.paths[relPath] ??= { sections: [] }
    let target = this.data.paths[relPath]
    target.sections.push(kv)
  }

  updateFile(
    relPath: string,
    kv: {
      uid?: any
      sid?: any
      review?
      after?
      before?
      tags?
      flags?: string[]
    },
  ) {
    // TODO ..
    let item = this._createItem(relPath)
    item.base = this.pathBaseDir

    item.before = kv.before
    item.after = kv.after
    item.tags = kv.tags
    item.flags = kv.flags
    this.data.paths_v2[relPath] = item

    this.data.paths[relPath] ??= { sections: [], scanTime: new Date() }

    let target = this.data.paths[relPath]

    let keys: Array<keyof PathItem> = ['uid', 'sid', 'after', 'before', 'tags']
    //

    keys.forEach(key => {
      if (!isBlank(kv[key])) {
        target[key] = kv[key]
      }
    })
    const pathItemToIndexItem = () => {}

    target.mtime = item.mtime
    target.inode = item.inode
    if (!isBlank(kv.flags)) {
      target.flags = kv.flags
    }
    return item
  }

  toJSON() {
    let copy = deepCopy(this.data)
    delete copy.paths_v2

    Object.values(copy.paths).forEach(path => {
      if (path.sections.length === 0) {
        delete path.sections
      }
    })

    // TODO drop ?? {}
    // TODO dedup up
    Object.values(copy.paths_v2 ?? {}).forEach(item => {
      console.log('see!')

      let target = copy.paths[item.path]
      if (item.review) {
        target.review = item.review
      }
    })

    copy['items'] = []
    Object.entries(copy.paths).forEach(([key, item]) => {
      copy['items'].push({ pathRelative: key, type: 'path', ...item })
    })

    // Remove keys with value {}
    // let obj = copy.paths
    // for (const key in obj) {
    //   if (
    //     typeof obj[key] === 'object' &&
    //     obj[key] !== null &&
    //     Object.keys(obj[key]).length === 0
    //   ) {
    //     delete obj[key]
    //   }
    // }

    return copy
  }

  write() {
    this.fs.writeFileSync(
      this.pathIndexFile,
      JSON.stringify(this.data, null, 2),
    )
  }

  static async fromDir(kv: { indexDir: string; baseDir: string }) {
    let path = join(kv.indexDir, 'workspace-index.json')
    let obj = new this({ path })
    obj.pathBaseDir = kv.baseDir
    if (fs.existsSync(path)) {
      let json = fs.readFileSync(path).toString()
      obj.loadJSON(json)
    }
    return obj
  }
}

function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

// TODO #review #utils #refactor
function isBlank(value: any): boolean {
  if (value === undefined) return true
  if (value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true

  function isPlainObjectEmpty(obj) {
    return obj && obj.constructor === Object && Object.keys(obj).length === 0
  }

  if (isPlainObjectEmpty(value)) {
    return true
  }
  return false
}
