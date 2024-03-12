import * as fs from 'fs'

const TYPE = 'https://taskfolders.com/types/script-data'

export class ScriptStatus {
  type = TYPE
  timestamp = new Date()
  ok: boolean
  result?: any
  duration?: number

  constructor(kv: { error?: any; start?: Date } = {}) {
    this.ok = !kv.error
    if (kv.start) {
      this.duration = new Date().getTime() - kv.start.getTime()
    }
  }

  static tryRead(kv: { fs: typeof fs; path: string }) {
    if (!kv.fs.existsSync(kv.path)) {
      return null
    }

    let data = kv.fs.readFileSync(kv.path)
    let doc = JSON.parse(data.toString())
    if (doc.type !== TYPE) return
    return this.fromJSON(doc)
  }

  static fromJSON(doc: any) {
    let obj = new this()
    Object.assign(obj, doc)
    obj.timestamp = new Date(doc.timestamp)
    return obj
  }
}
