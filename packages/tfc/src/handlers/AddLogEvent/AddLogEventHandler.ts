import fsRaw from 'node:fs'
import { LogRepository } from './LogRepository.js'
import { dirTaskfoldersData } from './dirTaskfoldersData.js'

export class AddLogEventHandler {
  fs = fsRaw
  constructor(public params: { cwd; message }) {}

  async execute(): Promise<void> {
    let { params: p, fs } = this

    let joinData = dirTaskfoldersData(p.cwd)

    let path = joinData('logs.json', { ensureDir: true, fs })
    let repo = LogRepository.from({ cwd: p.cwd, fs })
    repo.data.logs.push({
      timestamp: new Date().toISOString(),
      message: p.message,
    })

    await repo.write()
  }
}
