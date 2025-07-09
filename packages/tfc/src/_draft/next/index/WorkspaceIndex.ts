import * as fs from 'node:fs'
import { FlagKey, PathItem } from '../summary/PathItem.js'
import { join } from 'path/posix'
import { cleanObjectCopy } from '../cleanObject.js'
import { ensureWords } from '../StandardMetadata.js'
import { isBlank } from './isBlank.js'
import { isDate, isValid } from 'date-fns'
import { toDate } from '../toDate.js'
import * as Path from 'node:path'
import { TimeMark } from '../TimeMark.js'
import { SectionSummary } from '../scan/parseMarkdownSections.js'

export const pathIndexToPathItem = (kv: {
  index: PathIndex
  wsName: string
  baseDir: string
}) => {
  let { index } = kv
  let item = new PathItem({ pathRelative: index.pathRelative })
  //next.wsName = wsName
  item.wsName = kv.wsName
  // next.base = basePath
  item.base = kv.baseDir
  item.path = index.pathRelative
  item.after = index.after
  item.before = index.before
  item.tags = ensureWords(index.tags)
  item.uid = index.uid
  item.sid = index.sid
  item.done = index.done
  item.sections = index.sections_v2
  if (index.after_v2) {
    item.after_v2 = TimeMark.fromValue(index.after_v2)
  }
  item.flags = ensureWords(index.flags)
  return item
}

export type PathIndex = {
  sections_v2: SectionSummary[]
  sid?: any
  uid?: any
  /** @deprecated */
  after?: Date
  after_v2: TimeMark
  done?
  before?: Date
  tags?: string[]
  flags?: FlagKey[]
  review?: { next; latest? }
  scanTime?
  sections: { uid?; sid?; lineText? }[]
  calendar?: any[]

  // TODO future , not used in data.paths
  pathRelative?
  type: 'path' | 'section'
  inode?
  mtime?
}
export class WorkspaceIndex {
  findByReference(ref: string): PathItem {
    let found = this._index.sid[ref]
    if (found) return found
    return this._index.uid[ref]
  }
  _index = {
    /** @deprecated */
    uids: {},
    sid: {} as Record<string, PathItem>,
    uid: {} as Record<string, PathItem>,
  }
  _items: PathItem[] = []
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
    let file = new PathItem({ pathRelative: path })
    file.path = path
    file.base = this.pathBaseDir
    let found = this.data.paths[path] ?? {}
    // TODO
    // Object.assign(file, found)
    return file
    // console.log(found)
  }

  _createItem(path: string) {
    let file = new PathItem({ pathRelative: path })
    file.base = this.pathBaseDir
    let found = this.data.paths[path] ?? {}
    //Object.assign(file, found)
    for (let key in Object.keys(found)) {
      file[key] = found[key]
    }

    // Object.assign(file, found)
    return file
    // console.log(found)
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
    this._items = []
    let wsName = 'xx'
    let baseDir = this.pathBaseDir

    Object.entries(this.data.paths).forEach(([pathRelative, index]) => {
      this._items.push(
        pathIndexToPathItem({
          // TODO review.. why not already .index.pathRelative?
          index: { pathRelative, ...index },
          wsName,
          baseDir,
        }),
      )
    })

    for (let item of this._items) {
      if (item.sid) {
        this._index.sid[item.sid] = item
      }
      if (item.uid) {
        this._index.uid[item.uid] = item
      }
    }

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
    // TODO def-path-index
    this.data.paths[relPath] ??= { sections: [] } as PathIndex
    let target = this.data.paths[relPath]
    target.sections.push(kv)
  }

  updateFile(
    relPath: string,
    kv: {
      uid?: any
      sid?: any
      review?
      done?
      after?
      before?
      tags?
      flags?: FlagKey[]
      sections?: SectionSummary[]
    },
  ) {
    // TODO ..
    // if (0) {
    //   let item = this._createItem(relPath)
    //   item.base = this.pathBaseDir
    //   item.before = kv.before
    //   item.after = kv.after

    //   if (kv.after) {
    //     if (isDate(kv.after)) {
    //       item.after = kv.after
    //     } else {
    //       item.after = toDate(kv.after)
    //     }
    //   }
    //   item.tags = kv.tags
    //   item.flags = kv.flags
    //   this.data.paths_v2[relPath] = item
    // }

    // TODO def-path-index
    // @ts-expect-error TODO
    this.data.paths[relPath] ??= { sections: [], scanTime: new Date() }

    let target = this.data.paths[relPath]

    let keys: Array<keyof PathItem> = [
      'uid',
      'sid',
      'after',
      'before',
      'tags',
      'done',
    ]
    //

    keys.forEach(key => {
      if (!isBlank(kv[key])) {
        let value = kv[key]
        if (['after'].includes(key)) {
          value = toDate(value)

          if (isDate(kv.after)) {
            if (isValid(kv.after)) {
              let tm = TimeMark.fromValue(kv.after)
              target.after_v2 = tm
            }
          } else {
            let tm = TimeMark.fromValue(kv.after)
            target.after_v2 = tm
          }
        }
        target[key] = value
      } else {
        // console.log('blank..', key)
      }
    })

    // target.pathRelative = relPath
    let full = Path.join(this.pathBaseDir, relPath)
    let stat = this.fs.statSync(full)

    target.mtime = stat.mtime
    target.inode = stat.ino
    if (!isBlank(kv.flags)) {
      target.flags = kv.flags
    }

    // sections
    target.sections_v2 = kv.sections

    return target
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
      let target = copy.paths[item.path]
      if (item.review) {
        target.review = item.review
      }
    })

    copy['items'] = []
    Object.entries(copy.paths).forEach(([key, item]) => {
      copy['items'].push({ pathRelative: key, type: 'path', ...item })
    })

    Object.entries(copy.paths).map(([key, val]) => {
      // TODO cleaner?
      //copy.paths[key] = cleanObjectCopy(copy.paths[key]) as any
      if (copy.paths[key].sections_v2?.length === 0) {
        delete copy.paths[key]
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

// TODO util?
function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
