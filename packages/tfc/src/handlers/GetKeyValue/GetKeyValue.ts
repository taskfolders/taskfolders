import { DiskIndexRepository } from '../ScanPathContent/disk-index/DiskIndexRepository.js'
import { DC } from '@taskfolders/utils/dependencies'
import { Logger } from '@taskfolders/utils/logger'
import { dirname } from 'node:path'
import { LocalFileSystem } from '@taskfolders/utils/fs'
import { fuseMarkdownData, MarkdownDocument } from '@taskfolders/utils/markdown'
import jp from 'jsonpath'
import { decryptGPGMessage } from '../../_draft/gpg/decryptGPGMessage.js'
import { getKeyPath } from './getKeyPath.js'
import { ActiveFile } from '../../_draft/walker/ActiveFile.js'

export class GetKeyValue {
  log = DC.inject(Logger)
  params: { id: string; query?: string }

  async parseMarkdown(raw: string) {
    let { params: p } = this

    let md = await MarkdownDocument.fromBody(raw)
    let data = await fuseMarkdownData(md)
    if (!p.query) {
      return data
    }

    //let out = jp.query(data, '$..' + p.query)[0]
    let out = getKeyPath(data, p.query).data
    return out
  }

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
      return await this.parseMarkdown(file.body)
    } else if (file.path.endsWith('.md.asc')) {
      let dec = await decryptGPGMessage(file.buffer)
      return await this.parseMarkdown(dec.message)
    } else {
      throw Error(`Do not know how to read data from file at ${file.path}`)
    }
    throw Error(`Could not find data block for :${p.id}`)
  }
}
