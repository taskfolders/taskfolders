import { Logger } from '../Logger.js'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { findUpWorkspace } from '../findUpWorkspace.js'
import * as fs from 'fs'
import { parseWorkspaceIndex } from './parseWorkspaceIndex.js'
import { PathItem } from './PathItem.js'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'

export class SummaryHandler {
  log = new Logger()

  constructor(public params: { cwd: string }) {}

  async fetchSummaryData() {
    let { log } = this
    log.info('ShowHandler.execute called', log.link({ path: __filename }))
    let ws = await findUpWorkspace(this.params.cwd)

    let path = ws.dataDir({ join: ['workspace-index.json'] })
    log.info('Reading workspace index from', log.link({ path }))
    let body = fs.readFileSync(path, 'utf-8').toString()

    let index = WorkspaceIndex.fromJSON(body, { path: ws.dir })

    let res = await parseWorkspaceIndex(index, { basePath: ws.dir })
    return res
  }

  async execute() {
    let res = await this.fetchSummaryData()
    let { log } = this
    console.log(res)

    for (let [key, val] of Object.entries(res)) {
      switch (key) {
        case 'waiting': {
          log.put('WAITING')
          log.indent()
          for (let item of val) {
            log.put(item.path)
          }
          log.dedent()
          break
        }
        case 'calendar': {
          log.put('CALENDAR', new Date().toISOString().slice(0, 10))
          let all = val.sort(
            (lhs, rhs) => lhs.date.getTime() - rhs.date.getTime(),
          )
          log.indent()
          for (let item of all) {
            let date = item.date.toISOString().slice(0, 10)
            log.put(date, item.title)
          }
          log.dedent()
          break
        }
        case 'now': {
          log.put('NOW')
          log.indent()
          let a1 = Object.groupBy(val, x => x.dir)
          // LOG group by inner dir
          // console.log(a1)
          let all = val as PathItem[]

          all = all.sort(
            (lhs, rhs) => rhs.mtime.getTime() - lhs.mtime.getTime(),
          )
          all.forEach(x => {
            if (x.show.startsWith('_')) return
            let time = x.mtime.toISOString().slice(0, 10)
            log.put(
              log.link({ text: padEnd(x.show, 30), path: x.pathFull }),
              time,
            )
          })
          log.dedent()
          break
        }
        default:
          log.dev('Todo key', key)
      }
    }
  }
}
