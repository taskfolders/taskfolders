import { LocalFileSystem } from '@taskfolders/utils/fs'
import { DiskIndexModel } from './DiskIndexModel.js'
import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { IssueItem } from '@taskfolders/utils/issues'
import { DC } from '@taskfolders/utils/dependencies'
import { AppDirs } from '../../../_draft/AppDirs.js'

export class DiskIndexRepository {
  dbFile: string
  model: DiskIndexModel
  fs = DC.inject(LocalFileSystem)
  dirs = DC.inject(AppDirs)

  async load() {
    let { fs } = this
    if (!this.dbFile) {
      this.dbFile = this.dirs.configPath('db.json')
    }
    let res = await fs.read(this.dbFile, { unsafe: true })
    if (!res) {
      this.model = new DiskIndexModel()
    } else {
      this.model = DiskIndexModel.fromJSON(res.json)
    }
  }

  upsert(kv: { file: ActiveFile; uid: string }) {
    let { model, fs } = this
    let found = model.uids[kv.uid]
    if (found && found.path !== kv.file.path) {
      if (fs.raw.existsSync(found.path)) {
        kv.file.issues.push(
          IssueItem.create({
            severity: 'error',
            code: 'duplicated-uid',
            message: 'uid already allocated to another file',
            data: {
              otherFile: found.path,
            },
          }),
        )
        return
        // moved file
      }
    }
    model.uids[kv.uid] = { path: kv.file.path, mtime: kv.file.stat.mtime }
  }

  pathForSid(sid: string) {
    let found = this.model.sids[sid]
    if (!found) return
    return this.model.uids[found]?.path
  }

  async save() {
    await this.fs.write(
      this.dbFile,
      this.model,
      // TODO drop
      { pretty: true },
    )
  }
}
