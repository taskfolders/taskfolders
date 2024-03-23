import { DiskIndexRepository } from './ScanPathContent/disk-index/DiskIndexRepository.js'
import { DC } from '@taskfolders/utils/dependencies'
import { Logger } from '@taskfolders/utils/logger'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { findUpAll } from '@taskfolders/utils/fs/findUpAll'
import { LocalFileSystem } from '@taskfolders/utils/fs'

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
    let fs = dc.fetch(LocalFileSystem)

    let fileCount = Object.keys(repo.model.uids).length
    let size: number
    if (await fs.exists(repo.dbFile)) {
      size = fs.raw.statSync(repo.dbFile).size
    }
    let dbSize = { bytes: size }

    let data = { version, configPath, fileCount, dbSize }
    return data
  }
}
