import { DiskIndexRepository } from './ScanPathContent/disk-index/DiskIndexRepository.js'
import { DC } from '@taskfolders/utils/dependencies'
import { Logger } from '@taskfolders/utils/logger'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'

export class GetAppInfo {
  async execute() {
    let dc = DC.get(this)

    let p1 = findUpAll({ startFrom: __dirname, findName: 'package.json' })[0]

    let doc = JSON.parse(readFileSync(p1).toString())
    let version = doc.version

    let { DiskIndexRepository } = await import(
      '../handlers/ScanPathContent/disk-index/DiskIndexRepository.js'
    )
    let repo = dc.fetch(DiskIndexRepository)
    await repo.load()

    let configPath = repo.dirs.configPath()

    let fileCount = Object.keys(repo.model.uids).length
    //let fs = dc.fetch(LocalFileSystem)
    let dbSize = repo.dbFile

    let data = { version, configPath, fileCount }
    return data
  }
}
