import { MarkdownDocument, MarkdownSections } from '@taskfolders/utils/markdown'
import { StandardMetadata } from '../../_draft/next/StandardMetadata.js'

import jp from 'jsonpath'
import nodeFS from 'node:fs'
import { join } from 'node:path'
import { NodeLogger } from '../../_draft/logger/NodeLogger.js'
import { findUpWorkspaceFolder } from '../../_draft/next/findUpWorkspace.js'
import { WorkspaceIndex } from '../../_draft/next/index/WorkspaceIndex.js'
import { decryptGPGMessage } from '../../_draft/gpg/decryptGPGMessage.js'

// TODO #now combine #dry ReadReferenceHandler

export class ReadMarkdownHandler {
  log = new NodeLogger()
  fs = nodeFS

  constructor(
    public params: {
      reference: string
      cwd: string
      stream?: string
      options?: { json }
    },
  ) {}

  async _fetchMarkdown() {
    let { fs } = this
    let p = this.params
    let payload: string
    if (p.stream) {
      payload = p.stream
    } else {
      let path = join(p.cwd, p.reference)
      if (this.fs.existsSync(path) === false) {
        let ws = await findUpWorkspaceFolder(p.cwd)
        // log.info(ws)
        let wsPath = ws.dataDir({ join: ['workspace-index.json'] })
        // log.info('Reading workspace index from', path)
        let body = fs.readFileSync(wsPath, 'utf-8').toString()
        let index = WorkspaceIndex.fromJSON(body, { path: wsPath })

        let found = index.findByReference(p.reference)
        if (found) {
          let full //= found.pathFull
          if (!full) {
            // TODO warn?? edge?
            full = join(ws.dir, found.pathRelative)
          }
          path = full

          payload = this.fs.readFileSync(full, 'utf-8')
        } else {
          throw Error(`Reference not found: ${p.reference}`)
        }
      } else {
        payload = this.fs.readFileSync(path, 'utf-8')
      }

      if (path.endsWith('.md.asc')) {
        let msg = await decryptGPGMessage(payload)
        // this.log.info('Decrypted payload:', msg)
        payload = msg.message
      }
    }
    let md = MarkdownDocument.fromBody(payload, { implicitFrontmatter: true })
    return md
  }

  // Simulate fetching a Markdown document

  async execute() {
    let { params: p } = this
    let md = await this._fetchMarkdown()
    let data = StandardMetadata.fromJSON(md.data)
    let r1 = await MarkdownSections.parse(md.content)
    let sections = r1.all.map(x => {
      let content = x.body?.trim()
      return { data: x.data, content }
    })
    let final = { front: md.data, sections, content: md.content }

    let res = final

    if (p.options?.json) {
      if (typeof res === 'object') {
        res = JSON.stringify(res, null, 2) as any
      }

      this.log.put(res)
    } else {
      this.log.put('?? print?? TODO')
    }
  }
}
