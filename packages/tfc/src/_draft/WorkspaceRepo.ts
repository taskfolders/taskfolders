import {
  TaskFoldersMarkdown,
  MarkdownDocument,
} from '@taskfolders/utils/markdown'
import * as FS from 'fs'
import * as Path from 'path'

class UidIndex {
  path: string
  static create(path: string) {
    let obj = new this()
    obj.path = path
    return obj
  }
}

class WorkspaceIndexData {
  type = 'taskfolders.com/types/workspace-data/index'
  timestamp = new Date().toISOString()
  uids: Record<string, UidIndex> = {}
}

import { findUpAll } from '@taskfolders/utils/fs/findUpAll'

export const findWorkspaceUp = async (dir: string, fs = FS) => {
  let all = findUpAll({ startFrom: dir, findName: 'index.md' })

  let found
  for (let x of all) {
    let body = fs.readFileSync(x).toString()
    let md = await MarkdownDocument.fromBody<any>(body)
    //let md = await TaskFoldersMarkdown.fromBody(body)
    let thing = md.data?.flags
    if (!thing) continue
    let flags = [].concat(thing)
    if (flags.includes('workspace')) {
      let dir = Path.dirname(x)
      found = { path: x, dir }
    }
  }
  return found
}

export class WorkspaceRepo {
  pathData: string
  pathBase: string

  static async findUp(dir: string) {
    let found = await findWorkspaceUp(dir, FS)
    let obj = new this({ pathBase: found.dir })
    return obj
  }

  constructor(kv: { pathBase }) {
    this.pathBase = kv.pathBase
    this.pathData = Path.join(this.pathBase, '_data/index.json')
  }

  index = new WorkspaceIndexData()

  async indexMarkdown(kv: { markdown: TaskFoldersMarkdown; path }) {
    let path = Path.relative(this.pathBase, kv.path)
    let uid = kv.markdown.data?.uid
    if (!uid) return
    let data = kv.markdown.data
    let idx = UidIndex.create(path)

    this.index.uids[uid] = idx
  }

  async save() {
    let dir = Path.dirname(this.pathData)

    if (!FS.existsSync(dir)) {
      FS.mkdirSync(Path.dirname(this.pathData))
    }
    let json = JSON.stringify(this.index, null, 2)
    FS.writeFileSync(this.pathData, json)
  }
}
