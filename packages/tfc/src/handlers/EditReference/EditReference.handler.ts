import { mkdtemp, rm } from 'node:fs/promises'
import { NodeLogger } from '../../_draft/next/Logger.js'
import * as fs from 'node:fs'
import { isAbsolute } from 'path'
import * as Path from 'node:path'
import { decryptGPGMessage } from '../../_draft/gpg/decryptGPGMessage.js'
import { MarkdownDocument } from '@taskfolders/utils/markdown'

let log = new NodeLogger()

import { spawnSync } from 'child_process'
import { createHash } from 'node:crypto'
import { encryptGPGMessage } from '../../_draft/gpg/encryptGPGMessage.js'
import { StandardMetadata } from '../../_draft/next/StandardMetadata.js'
import { isEqual } from '../../_draft/isEqual.js'

function editFileInEditor(kv: { path }) {
  const result = spawnSync('code', ['--wait', kv.path], {
    stdio: 'inherit',
  })

  if (result.error) {
    console.error('Failed to run command:', result.error)
    console.error('stderr', result.stderr)
    let error = Error('Failed to run command')
    error.cause = result.error
    throw error
  } else {
    // console.log('Editor closed. Exit code:', result.status)
  }
}

export class EditReferenceHandler {
  constructor(public params: { reference: string }) {}

  async execute() {
    let { params: p } = this
    let pathEncrypted = Path.isAbsolute(p.reference)
      ? p.reference
      : Path.join(process.cwd(), p.reference)

    log.info('Decrypting file', pathEncrypted)
    if (!pathEncrypted.endsWith('.md.asc')) {
      throw Error(`Not encrypted file ${pathEncrypted}`)
    }
    let file = fs.readFileSync(pathEncrypted)
    let decrypted = await decryptGPGMessage(file)

    log.info(
      'Decrypted with recipients',
      decrypted.keys.map(x => x.keyTitle),
    )

    const tmpFolder = await mkdtemp('/tmp/taskfolders.com-')
    try {
      log.info('Created temp directory:', tmpFolder)

      let baseNameDecrypted = Path.basename(
        pathEncrypted.replace(/\.md\.asc$/, '.md'),
      )
      let pathDecrypted = Path.join(tmpFolder, baseNameDecrypted)

      log.info('Write file', pathDecrypted)
      fs.writeFileSync(pathDecrypted, decrypted.message)

      let beforeBodyDecrypted = decrypted.message

      const beforeChecksum = createHash('sha256')
        .update(beforeBodyDecrypted)
        .digest('hex')

      log.dev({ pathDecrypted, pathEncrypted, beforeChecksum })

      log.info('Open and wait for editor')
      editFileInEditor({ path: pathDecrypted })

      let afterBody = fs.readFileSync(pathDecrypted).toString()
      let afterMd = await MarkdownDocument.fromBody(afterBody, {
        implicitFrontmatter: true,
      })
      const afterChecksum = createHash('sha256').update(afterBody).digest('hex')

      if (afterChecksum === beforeChecksum) {
        log.info('No changes were detected')
      } else {
        log.warn('Changes detected, encrypting file again')

        let metaAfter = new StandardMetadata(afterMd.data)
        let recipients = metaAfter.recipients

        let beforeMd = await MarkdownDocument.fromBody(beforeBodyDecrypted, {
          implicitFrontmatter: true,
        })
        let beforeMeta = new StandardMetadata(beforeMd.data)
        if (!isEqual(beforeMeta.recipients, metaAfter.recipients)) {
          log.warn('TODO recipients changed from given ones')
        }

        {
          // TODO
          //  if (!isEqual(decrypted.keys, metaAfter.recipients)) {
          //   log.warn('TODO recipients changed from given ones')
          // }
          if (recipients.length === 0) {
            log.warn('TODO No recipients specified')
          }

          if (decrypted.keys.length !== recipients.length) {
            log.warn('TODO Recipient count modified')
          }
        }

        log.info('Encrypting with recipients', recipients)

        let encrypted = await encryptGPGMessage({
          message: afterBody,
          recipients: recipients,
          armor: true,
        })
        log.info('Write changes to', pathEncrypted)
        fs.writeFileSync(pathEncrypted, encrypted.buffer)
      }
    } finally {
      await rm(tmpFolder, { recursive: true, force: true })
      log.info('Delete temp directory:', tmpFolder)
    }
  }
}
