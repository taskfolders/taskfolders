import { ActiveFile } from '../../../_draft/walker/ActiveFile.js'
import { BaseFileScanner } from './BaseFileScanner.js'

export class ScriptScanner extends BaseFileScanner {
  async execute(kv: { file: ActiveFile }) {
    let { file } = kv
    let ext = file.path.split('.').at(-1)
    if (['sh', 'bash', 'zsh'].includes(ext)) {
      let lines = file.body.split('\n')
      for (let line of lines) {
        let ma = line.match(/#\s+@uid\s+(?<uid>\S+)/)
        let uid = ma?.groups?.uid
        if (uid) {
          this.disk.upsert({ file, uid })
          return { engine: 'script-comment' }
        }
      }
    }
  }
}
