import { Logger } from '../Logger.js'
import {
  addDays,
  differenceInCalendarDays,
  getWeek,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isWithinInterval,
} from 'date-fns'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { findUpWorkspace } from '../findUpWorkspace.js'
import * as fs from 'fs'
import { parseWorkspaceIndex, IndexResult } from './parseWorkspaceIndex.js'
import { PathItem } from './PathItem.js'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'
import { Folder } from '../Folder.js'
import { WorkspaceCollections } from '../scan/WorkspaceCollections.js'
import { timeDiff } from './timeDiff.js'
type Fox = { path; started; due }

const dimKeysApply = item => {
  for (let key in item) {
    item[key] = Logger.style.dim(item[key])
  }
}

const toPathPrint = (x: PathItem) => {
  let cap = PathPadding - 5
  let pathStr = x.path.replace('/index.md', '')
  if (pathStr.length > cap) {
    pathStr = '…' + pathStr.slice(pathStr.length - cap + 1)
  }
  pathStr = `{${x.wsName ?? 'x'}}:` + pathStr
  let pathShow = Logger.link({ text: pathStr, path: x.pathFull })
  return pathShow
}

const PathPadding = 50

const printOptions = {
  hideAfterDays: 24,
}

const printTable = <T>(kv: {
  rows: T[]
  log: Logger
  keys?: Array<keyof T>
  config?: Partial<Record<keyof T, { padding: number; head?: string }>>
}) => {
  let { rows, log, keys, config } = kv
  if (rows.length === 0) return
  config ??= {}
  // let heads = ['', 'Started *', 'Due']

  // keys = ['path', 'started', 'due']
  // @ts-expect-error TODO
  keys ??= Object.keys(kv.rows[0])
  Object.keys(kv.rows[0]).forEach(key => {
    config[key] ??= {}
    config[key].head ??= key
  })

  // let headLine = zip(heads, paddings).map(([head, padding]) => {
  //   return head.padEnd(padding)
  // })

  let headLine = keys.map(key => {
    let conf = config[key]
    return padEnd(conf.head, conf.padding)
  })

  log.put(...headLine)

  for (let row of Object.values(kv.rows)) {
    let pathLine = keys
      .map((key, idx) => {
        let padding = config[key].padding
        return padEnd(row[key].toString(), padding)
        //return row[key] ? row[key].toString().padEnd(paddings[i]) : ''
      })
      .join(' ')
    log.put(pathLine)
  }
}

export class SummaryHandler {
  log = new Logger()
  index: WorkspaceIndex

  static async create(params: SummaryHandler['params']) {
    let sut = new SummaryHandler(params)
    await sut.setup()
    return sut
  }

  constructor(public params: { cwd: string; allWorkspaces?: boolean }) {}

  async setup() {
    let ws = await findUpWorkspace(this.params.cwd)

    let path = ws.dataDir({ join: ['workspace-index.json'] })
    let body = fs.readFileSync(path, 'utf-8').toString()
    let index = WorkspaceIndex.fromJSON(body, { path: ws.dir })
    this.index = index
  }

  async _getData() {
    await this.setup()

    let res: IndexResult = {
      calendar: [],
      waiting: [],
      now: [],
      active: [],
    }

    if (this.params.allWorkspaces) {
      let loc = WorkspaceCollections.request()
      for (let val of Object.values(loc.data.workspaces)) {
        // TODO clean
        let folder = new Folder(val.dir)
        let path = folder.dataDir({ join: ['workspace-index.json'] })

        let body = fs.readFileSync(path, 'utf-8').toString()

        let index = WorkspaceIndex.fromJSON(body, { path: val.dir })

        let one = await parseWorkspaceIndex(index, {
          basePath: val.dir,
          wsName: val.sid,
        })
        Object.keys(one).forEach(key => {
          res[key] = res[key].concat(one[key])
        })
      }
    } else {
      let ws = await findUpWorkspace(this.params.cwd)
      // TODO #refactor #workspace
      res = await parseWorkspaceIndex(this.index, {
        basePath: ws.dir,
        wsName: ws.data_std.sid,
      })
    }

    {
      // SORT by path

      res.active.sort((lhs, rhs) =>
        lhs.pathRelative.localeCompare(rhs.pathRelative),
      )

      // console.dir(res.active, { breakLength: 1 })
      // res.active.map(x => console.log(x))
    }

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

    let now = new Date()
    for (let [key, val] of Object.entries(data)) {
      // TODO wtf? clean #type
      type foo = keyof typeof data
      switch (key as foo) {
        case 'waiting': {
          printSection('Waiting')
          log.indent()

          let all = val as PathItem[]
          let rows = all
            .map(x => {
              //let started = x.after ? x.after.toISOString().slice(0, 10) : ''
              let started = x.after ? timeDiff({ date: x.after }) : ''
              let item = {
                // path: log.link({ text: x.path, path: x.pathFull }),
                path: toPathPrint(x),
                started,
                // due: '',
              }

              if (now < x.after) {
                let days = differenceInCalendarDays(x.after, now)
                if (days > printOptions.hideAfterDays) {
                  return null
                }

                dimKeysApply(item)
              }
              return item
            })
            .filter(Boolean)

          printTable({
            rows,
            log,
            config: { path: { padding: PathPadding, head: '' } },
          })
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
          // LOG group by inner dir
          // console.log(a1)
          let all = val as PathItem[]

          type Row = { path; modified; due; after }
          let rows: Row[] = []
          all = all.sort(
            (lhs, rhs) => rhs.mtime.getTime() - lhs.mtime.getTime(),
          )
          all.forEach(x => {
            // if (x.show.startsWith('_')) return
            let time = x.mtime.toISOString().slice(0, 10)
            // let time = ''

            let path = toPathPrint(x)
            let next = {
              path,
              modified: timeDiff({ date: x.mtime, color: false }),
              due: '',
              after: x.after ? x.after.toISOString().slice(0, 10) : '',
            }

            if (x.after) {
              if (x.after < now) {
                rows.push(next)
              }
            } else {
              rows.push(next)
            }
          })

          printTable({
            rows,
            log,
            config: {
              path: { padding: PathPadding, head: '' },
              modified: { padding: 12, head: 'Modified *' },
            },
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
          let t1 = Object.groupBy(all, x => {
            if (now.getTime() < x.after.getTime()) {
              return 'postponed'
            }
            return 'started'
          })

          log.indent()
          log.put(
            `total=${val.length} active=${t1.started?.length ?? 0} postponed=${
              t1.postponed?.length ?? 0
            }`,
          )

          let rows: Fox[] = []

          all.forEach(x => {
            // let mtime = x.mtime.toISOString().slice(0, 10)
            let started = ''
            if (x.after) {
              started = timeDiff({ date: x.after, color: false })
            }
            let isActive = now.getTime() > x.after.getTime()

            let due = x.before ? timeDiff({ date: x.before }) : ''

            let item = { path: toPathPrint(x), started, due }

            if (!isActive) {
              let days = differenceInCalendarDays(x.after, now)
              if (days > printOptions.hideAfterDays) {
                return null
              }

              dimKeysApply(item)
            }
            rows.push(item)
          })

          printTable({
            rows,
            log,
            config: {
              path: { padding: PathPadding, head: '' },
              started: { padding: 12 },
            },
          })
          //
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

function zip(arr1, arr2) {
  const length = Math.max(arr1.length, arr2.length)
  const zipped = []
  for (let i = 0; i < length; i++) {
    zipped.push([arr1[i], arr2[i]])
  }
  return zipped
}
