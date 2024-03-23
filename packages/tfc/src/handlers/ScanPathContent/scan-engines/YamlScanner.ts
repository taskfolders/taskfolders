import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { BaseFileScanner } from './BaseFileScanner.js'

export class YamlScanner extends BaseFileScanner {
  async execute(kv: { file: ActiveFile }) {
    let { file } = kv
    let ext = file.path.split('.').at(-1)
    if (['yml', 'yaml'].includes(ext)) {
      let lines = file.body.split('\n')
      for (let line of lines) {
        let ma = line.match(/#\s+@uid\s+(?<uid>\S+)/)
        let uid = ma?.groups?.uid
        if (uid) {
          await this.disk.upsert({ file, uid })
          return { engine: 'yaml-comment' }
        }
      }
    }
  }
}
