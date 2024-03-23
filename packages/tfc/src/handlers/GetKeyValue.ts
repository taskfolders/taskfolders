import { DiskIndexRepository } from './ScanPathContent/disk-index/DiskIndexRepository.js'
import { DC } from '@taskfolders/utils/dependencies'
import { Logger } from '@taskfolders/utils/logger'
import { dirname } from 'node:path'
import { LocalFileSystem } from '@taskfolders/utils/fs'
import { MarkdownDocument } from '@taskfolders/utils/markdown'
import jp from 'jsonpath'
export class GetKeyValue {
  log = DC.inject(Logger)
  params: { id: string; query?: string }

  async execute() {
    let { params: p } = this
    let dc = DC.get(this)
    let repo = dc.fetch(DiskIndexRepository)
    await repo.load()

    let found = repo.findById(p.id)
    if (!found) {
      throw Error(`Could not find :${p.id}`)
    }
    let { path } = found

    let fs = dc.fetch(LocalFileSystem)
    let file = await fs.read(path)

    if (file.path.endsWith('.md')) {
      let md = await MarkdownDocument.fromBody(file.body)
      let data = md.data
      if (!p.query) {
        return data
      }

      let out = jp.query(data, '$..' + p.query)[0]
      return out
    } else if (file.path.endsWith('.md.asc')) {
      throw Error('todo')
    }
    throw Error(`Could not find data block for :${p.id}`)
  }
}
