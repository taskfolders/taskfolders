import * as fs from 'node:fs'
import { PathItem } from './summary/PathItem.js'
import { join } from 'path/posix'

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
  } as {
    type: string
    version: number
    paths: Record<
      string,
      {
        sid?: any
        uid?: any
        scanTime?
        sections: { uid?; sid?; lineText? }[]
        calendar?: any[]
      }
    >
  }

  get(path: string) {
    let file = new PathItem()
    file.path = path
    file.base = this.pathBaseDir
    let found = this.data.paths[path] ?? {}
    Object.assign(file, found)
    return file
    console.log(found)
  }

  constructor(kv: { path }) {
    this.pathIndexFile = kv.path
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

  updateFile(relPath: string, kv: { uid?: any; sid?: any }) {
    this.data.paths[relPath] ??= { sections: [], scanTime: new Date() }
    let target = this.data.paths[relPath]
    if (kv.uid) {
      target.uid = kv.uid
    }
    if (kv.sid) {
      target.sid = kv.sid
    }
  }

  toJSON() {
    let copy = deepCopy(this.data)
    Object.values(copy.paths).forEach(path => {
      if (path.sections.length === 0) {
        delete path.sections
      }
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
