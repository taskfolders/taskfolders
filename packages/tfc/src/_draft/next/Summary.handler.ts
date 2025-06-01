import { Logger } from './Logger.js'
import { WorkspaceIndex } from './WorkspaceIndex.js'
import { findUpWorkspace } from './findUpWorkspace.js'
import * as fs from 'fs'
import { parseWorkspaceIndex } from './parseWorkspaceIndex.js'

export class SummaryHandler {
  log = new Logger()

  constructor(public params: { cwd: string }) {}

  async execute() {
    let { log } = this
    log.info('ShowHandler.execute called', __filename)
    let ws = await findUpWorkspace(this.params.cwd)

    let path = ws.dataDir({ join: ['workspace-index.json'] })
    log.info('Reading workspace index from', path)
    let body = fs.readFileSync(path, 'utf-8').toString()

    let index = WorkspaceIndex.fromJSON(body)
    let res = await parseWorkspaceIndex(index)
    log.info(res)
  }
}
