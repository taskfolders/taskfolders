import { IndexMeta } from './IndexMeta.js'

export class DiskIndexModel {
  static type = 'https://taskfolders.com/docs/disk-index'
  type = DiskIndexModel.type

  latestUpdate: Date

  /** @deprecated */
  items: Record<string, IndexMeta>

  //paths: Record<string, IndexMeta> = {}

  uids: Record<string, { path: string; mtime; inode? }> = {}

  workspaces = new Set<string>()
  //workspaces: Record<string, { path: string }> = {}

  sids: Record<string, string> = {}

  static create(obj: Partial<DiskIndexModel>) {
    return obj
  }

  static fromJSON(doc) {
    let obj = new this()
    Object.assign(obj, doc)
    obj.workspaces = new Set(doc.workspaces)
    return obj
  }

  toJSON() {
    let copy = { ...this }
    /* rootCopy.paths = Object.fromEntries(
      Object.entries(rootCopy.paths).map(([key, value]) => {
        let copy = value.toJSON()
        delete copy.path
        return [key, copy as any]
      }),
    ) */
    copy.workspaces = [...this.workspaces] as any
    return copy
  }
}
