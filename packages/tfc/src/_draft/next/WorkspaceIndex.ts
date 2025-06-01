export class WorkspaceIndex {
  _index = { uids: {} }
  path: string
  timestamp = new Date()

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
        sections: { uid?; sid?; lineText? }[]
        calendar?: any[]
      }
    >
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
    this.data.paths[relPath] ??= { sections: [] }
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
    let obj = copy.paths
    for (const key in obj) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        Object.keys(obj[key]).length === 0
      ) {
        delete obj[key]
      }
    }
    //cleanObject(copy)
    return copy
  }
}
function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
