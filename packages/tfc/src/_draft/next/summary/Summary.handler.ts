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
import { Folder } from '../Folder.js'

export class SummaryHandler {
  log = new Logger()
  index: WorkspaceIndex
  ws: Folder

  constructor(public params: { cwd: string }) {}

  async setup() {
    let ws = await findUpWorkspace(this.params.cwd)
    this.ws = ws

    let path = ws.dataDir({ join: ['workspace-index.json'] })
    let body = fs.readFileSync(path, 'utf-8').toString()
    let index = WorkspaceIndex.fromJSON(body, { path: ws.dir })
    this.index = index
  }

  async _getData() {
    let { ws } = this
    await this.setup()

    let res = await parseWorkspaceIndex(this.index, { basePath: ws.dir })
    return res
  }

  async _printData(data: Awaited<ReturnType<typeof parseWorkspaceIndex>>) {
    let { log } = this
    let today_str = new Date().toISOString().slice(0, 10)
    let weekNumberNow = getWeek(new Date())

    let printSection = x => log.put().put(log.style.blue(x))

    log.put().put(`${today_str} : Week ${weekNumberNow} {theme name?}`).put()

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
        // case 'review':
        //   // TODO
        //   printSection('Review')
        //   log.indent().dev('Todo review', key)
        //   log.dedent()
        //   break

        case 'active': {
          printSection('Active')

          let all = val as PathItem[]
          let now = new Date()
          let t1 = Object.groupBy(all, x => {
            if (now.getTime() < x.after.getTime()) {
              return 'postponed'
            }
            return 'started'
          })

          log.indent()
          log.put(
            `total=${val.length} active=${t1.started.length} postponed=${t1.postponed.length}`,
          )
          log.put(''.padEnd(40), 'Started *'.padEnd(16), 'Due')
          all.forEach(x => {
            // let mtime = x.mtime.toISOString().slice(0, 10)
            let started = ''
            if (x.after) {
              started = x.after.toISOString().slice(0, 10)
              let weekStarted = getWeek(x.after)
              started = `W${getWeek(x.after)} ${(weekStarted - weekNumberNow)
                .toString()
                .padStart(2)}w`
            }
            let isActive = now.getTime() > x.after.getTime()

            let due = ''
            if (x.before) {
              let weekDue = getWeek(x.before)
              let symbol = weekDue > weekNumberNow ? '+' : '-'
              due = `W${getWeek(x.before)} ${symbol}${(weekDue - weekNumberNow)
                .toString()
                .padStart(2)}w`
            }

            let line = [
              log.link({ text: padEnd(x.path, 40), path: x.pathFull }),
              started.padEnd(16),
              due,
            ].join(' ')
            if (!isActive) {
              line = log.style.dim(line)
            }
            log.put(line)
          })
          log.dedent()

          break
        }

        default:
          throw Error(`unknown key ${key}`)
      }
    }
  }

  async execute() {
    let { log } = this
    log.info('ShowHandler.execute called', log.link({ path: __filename }))
    let res = await this._getData()
    await this._printData(res)
  }
}
