import * as Path from 'node:path'
import { DiskIndexRepository } from '../disk-index/DiskIndexRepository.js'
import { Logger } from '@taskfolders/utils/logger'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { isUUID } from '@taskfolders/utils/regex/UUID'
import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { BaseFileScanner } from './BaseFileScanner.js'

function isMarkdownFile(x: string) {
  return /(\.(md|markdown)$)/.test(x)
}

export class MarkdownScanner extends BaseFileScanner {
  code = 'markdown'

  async execute(kv: { file: ActiveFile }) {
    let { file } = kv
    let { log, options, disk } = this

    if (isMarkdownFile(file.path)) {
      try {
        let md = await TaskFoldersMarkdown.parse(file.body, {
          coerce: options.convert,
        })

        // if (error) {
        //   file.issues.push({ severity: 'error', code: 'md-parse-error' })
        // }
        log.debug('Scan md file', file.path)

        let uid = md.plain.data?.uid ?? md.taskfolder?.data.uid
        if (isUUID(uid)) {
          //log.screen.indent().put(uid)
        } else if (!uid && md.taskfolder) {
          uid = crypto.randomUUID()
          md.taskfolder.data._writeModel.uid = uid
          file.modified = true
          file.body = md.taskfolder.toString()
          file.issues.push({
            severity: 'info',
            code: 'allocate-uid',
            message: 'Allocate an :uid field',
          })
        }

        if (isUUID(uid)) {
          await disk.upsert({ file, uid })
        }

        if (md.taskfolder) {
          let data = md.taskfolder.data
          if (data.workspace) {
            disk.model.workspaces.add(uid)
          }
          if (data.sid) {
            disk.model.sids[data.sid] = uid
          }
        }
      } catch (e) {
        log.debug({ path: file.path, error: e })
        file.issues.push({ severity: 'error', code: 'md-parse-error' })
      }

      return { engine: 'tf-markdown' }
    }
  }
}
