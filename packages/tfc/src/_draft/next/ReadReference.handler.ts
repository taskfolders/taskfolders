import { findUpWorkspace } from './findUpWorkspace.js'
import { Logger } from './Logger.js'
import { WorkspaceIndex } from './index/WorkspaceIndex.js'
import { readFileSync } from 'fs'
import * as fs from 'fs'
import { join } from 'path/posix'
import { decryptGPGMessage } from '../gpg/decryptGPGMessage.js'
import { MarkdownDocument } from '@taskfolders/utils/markdown'

export class ReadReferenceHandler {
  log = new Logger()

  constructor(public params: { cwd: string; id: string }) {}

  async execute() {
    let { log } = this
    // TODO log.raw({__filename})
    log.info('ShowHandler.execute called', __filename)
    let ws = await findUpWorkspace(process.cwd())
    log.info(ws)
    let path = ws.dataDir({ join: ['workspace-index.json'] })
    log.info('Reading workspace index from', path)
    let body = fs.readFileSync(path, 'utf-8').toString()
    let index = WorkspaceIndex.fromJSON(body, { path })

    let found = index.find({ uid: this.params.id })
    log.info('Found item:', found)
    let p2 = join(ws.dir, found.path)
    let body_2 = fs.readFileSync(p2, 'utf-8').toString()
    if (found.path.endsWith('.md.asc')) {
      body_2 = await decryptGPGMessage(body_2).then(x => x.message)
      console.log('Decrypted body:', body_2)

      let md = await MarkdownDocument.fromBody(body_2, {
        implicitFrontmatter: true,
      })
      log.info('Found encrypted file:', p2)
      log.info('Data:', md.data)
      log.info('Body:', md.content)
    }
  }
}
