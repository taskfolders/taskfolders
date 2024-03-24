import * as Path from 'node:path'
import { DiskIndexRepository } from '../disk-index/DiskIndexRepository.js'
import { Logger } from '@taskfolders/utils/logger'
import { MarkdownDocument } from '@taskfolders/utils/markdown'
import { isUUID } from '@taskfolders/utils/regex/UUID'
import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { BaseFileScanner } from './BaseFileScanner.js'
import { decryptGPGMessage } from '../../../_draft/gpg/decryptGPGMessage.js'

export class EncryptedMarkdownScanner extends BaseFileScanner {
  code = 'encrypted-md'

  async execute(kv: { file: ActiveFile }) {
    let { file } = kv
    let { log, options, disk } = this

    if (file.path.endsWith('.md.asc')) {
      if (!file.body.includes('-----BEGIN PGP MESSAGE-----')) {
        throw Error('Non encrypted file with encrypted extension')
      }
      let dec = await decryptGPGMessage(file.buffer)

      // TODO md type - use uid in all case, rest fields if TF type
      let md = await MarkdownDocument.fromBody<any>(dec.message)
      if (!md) return
      if (!md.data) return
      let uid = md.data.uid
      let sid = md.data.sid
      if (uid) {
        disk.upsert({ file, uid, sid })
        return { engine: 'encrypted-md' }
      }
    }
  }
}
