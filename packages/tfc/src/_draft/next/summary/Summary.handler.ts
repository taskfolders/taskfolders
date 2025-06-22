import { Logger } from '../Logger.js'
import {
  addDays,
  getWeek,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isWithinInterval,
} from 'date-fns'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { findUpWorkspace } from '../findUpWorkspace.js'
import * as fs from 'fs'
import { parseWorkspaceIndex } from './parseWorkspaceIndex.js'
import { PathItem } from './PathItem.js'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'

export class SummaryHandler {
  log = new Logger()

  constructor(public params: { cwd: string }) {}

  async _getData() {
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

  async _printData(data: ReturnType<typeof parseWorkspaceIndex>) {
    let { log } = this
    let today_str = new Date().toISOString().slice(0, 10)
    let weekNumber = getWeek(new Date())

    let printSection = x => log.put().put(log.style.blue(x))

    log.put().put(`${today_str} : Week ${weekNumber} {theme name?}`).put()

    let today = new Date()
    let byNearTimeGroups = Object.groupBy(data.calendar, item => {
      if (isThisWeek(item.date)) return 'week'
      if (
        isWithinInterval(item.date, {
          start: addDays(today, 7),
          end: addDays(today, 30),
        })
      )
        return 'month'
      if (
        isWithinInterval(item.date, {
          start: addDays(today, 30),
          end: addDays(today, 360),
        })
      )
        return 'year'

      return 'rest'
    })
    console.log(byNearTimeGroups)

    for (let [key, val] of Object.entries(data)) {
      // TODO wtf? clean #type
      type foo = keyof typeof data
      switch (key as foo) {
        case 'waiting': {
          printSection('Waiting')
          log.indent()
          for (let item of val) {
            log.put(item.path)
          }
          log.dedent()
          break
        }
        case 'calendar': {
          printSection('Calendar')
          log.indent()
          let printAll = (val: { date; title }[]) => {
            let all = val.sort(
              (lhs, rhs) => lhs.date.getTime() - rhs.date.getTime(),
            )
            for (let item of all) {
              let date = item.date.toISOString().slice(0, 10)
              log.put(date, item.title)
            }
          }

          log.put('In a week').indent()
          if (byNearTimeGroups.week) {
            log.put('..todo')
          } else {
            log.put(log.style.dim('none'))
          }
          log.dedent()

          log.put('In a month').indent()
          if (byNearTimeGroups.month) {
            let val = byNearTimeGroups.month
            let all = val.sort(
              (lhs, rhs) => lhs.date.getTime() - rhs.date.getTime(),
            )
            for (let item of all) {
              let date = item.date.toISOString().slice(0, 10)
              log.put(date, item.title)
            }
          } else {
            log.put('..none')
          }
          log.dedent()

          log.put('In a year').indent()
          if (byNearTimeGroups.year) {
            printAll(byNearTimeGroups.year)
          } else {
            log.put('..none')
          }
          log.dedent()

          log.dedent()
          break
        }
        case 'now': {
          printSection('NOW')
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
        case 'review':
          printSection('Review')
          log.indent().dev('Todo review', key)
          break

        default:
          throw Error(`unknown key ${key}`)
      }
    }
  }

  async execute() {
    let res = await this._getData()
    await this._printData(res)
  }
}
