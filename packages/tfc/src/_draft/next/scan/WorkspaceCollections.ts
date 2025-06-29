import * as fs from 'node:fs'
import { join } from 'path/posix'

export class WorkspaceCollections {
  fs = fs
  file: string
  data: { type; workspaces: { dir; sid; uid } }

  static request() {
    let obj = new this()
    return obj
  }

  constructor() {
    let dir = join(process.env.HOME, '.config/TaskFolders.com')
    this.file = join(dir, 'workspaces.json')
    this.setup()
  }

  setup() {
    let { fs, file } = this
    if (fs.existsSync(file)) {
      let doc = JSON.parse(fs.readFileSync(file).toString())
      this.data = doc
    } else {
      this.data = {
        type: 'draft/workspace-locations',
        workspaces: {},
      }
    }
  }

  upsert(kv: { uid; dir; sid }) {
    this.data.workspaces[kv.dir] = kv
  }

  write() {
    let data = JSON.stringify(this.data, null, 2)
    this.fs.writeFileSync(this.file, data)
  }
}
