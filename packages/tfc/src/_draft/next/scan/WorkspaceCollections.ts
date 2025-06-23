import * as fs from 'node:fs'
import { join } from 'path/posix'

export class WorkspaceCollections {
  fs = fs
  file: string
  data: { type; workspaces: {}[] }

  constructor() {
    let dir = join(process.env.HOME, '.config/TaskFolders.com')
    this.file = join(dir, 'workspaces.json')
    let { fs, file } = this
    if (fs.existsSync(file)) {
      let doc = JSON.parse(fs.readFileSync(file).toString())
      this.data = doc
    } else {
      this.data = {
        type: 'draft/workspace-locations',
        workspaces: [],
      }
    }
  }

  upsert(kv: { uid; dir; sid }) {
    this.data.workspaces[kv.uid] = kv
  }

  write() {
    let data = JSON.stringify(this.data)
    this.fs.writeFileSync(this.file, data)
  }
}
