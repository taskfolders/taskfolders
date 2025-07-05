import { DiskIndexRepository } from './ScanPathContent/disk-index/DiskIndexRepository.js'
import { DC } from '@taskfolders/utils/dependencies'
// import { Logger } from '@taskfolders/utils/logger'
import { dirname } from 'node:path'
import { NodeLogger } from '../_draft/next/Logger.js'

export class ListWorkspaces {
  // log = DC.inject(Logger)
  log = new NodeLogger()
  async execute() {
    let dc = DC.get(this)
    let repo = dc.fetch(DiskIndexRepository)
    await repo.load()

    let acu = []
    repo.model.workspaces.forEach(uid => {
      let path = repo.model.uids[uid].path
      let dir = dirname(path)
      acu.push({ dir, uid })
    })
    acu.map(x => this.log.put(x.dir))
  }
}
