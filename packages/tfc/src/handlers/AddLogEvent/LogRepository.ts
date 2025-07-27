type LogData = {
  type: string
  logs: {
    timestamp: string
    message: string
  }[]
}

const defaultLogData = (): LogData => ({
  type: 'taskfolders.com/types/log/beta',
  logs: [],
})

import fsRaw from 'node:fs'
import { dirTaskfoldersData } from './dirTaskfoldersData.js'

export class LogRepository {
  data: LogData
  filePath: string
  fs: typeof fsRaw = fsRaw

  constructor(data: LogData) {
    this.data = data ?? defaultLogData()
  }

  static from(kv: { cwd: string; fs?: typeof fsRaw }): LogRepository {
    let fs = kv.fs || fsRaw
    let path = dirTaskfoldersData(kv.cwd)('logs.json', { ensureDir: true, fs })

    let data
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path, 'utf-8'))
    }
    let obj = new this(data)
    obj.filePath = path
    obj.fs = fs
    return obj
  }

  write() {
    this.fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
  }
}
