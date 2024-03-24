import * as Path from 'node:path'
import { DiskIndexRepository } from '../disk-index/DiskIndexRepository.js'
import { Logger } from '@taskfolders/utils/logger'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { isUUID } from '@taskfolders/utils/regex/UUID'
import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { BaseFileScanner } from './BaseFileScanner.js'

let sourceExt = ['ts', 'js', 'tsx', 'jsx', 'cjs', 'mjs']

export class SourceCodeScanner extends BaseFileScanner {
  code = 'source-code'

  async execute(kv: { file: ActiveFile }) {
    let { file } = kv
    let { log, options, disk } = this

    let ext = Path.basename(file.path).split('.').at(-1)
    if (sourceExt.includes(ext)) {
      let found_uid
      file.body.split('\n').find(x => {
        let ma = x.match(/\s+\/\/\s+@uid\s+([\w-]*)/)
        if (ma) {
          found_uid = ma[1]
          return true
        }
        ma = x.match(/\s+\*\s+@uid\s+([\w-]*)/)
        if (ma) {
          found_uid = ma[1]
          return true
        }
      })
      if (found_uid) {
        await disk.upsert({ file, uid: found_uid })
        return { engine: 'source-code' }
      }
    }
  }
}
