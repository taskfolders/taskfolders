import { NodeLogger } from '../../logger/NodeLogger.js'
import {
  addDays,
  differenceInCalendarDays,
  getWeek,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isWithinInterval,
} from 'date-fns'
import { WorkspaceIndex } from '../index/WorkspaceIndex.js'
import { findUpWorkspaceFolder } from '../findUpWorkspace.js'
import * as fsRaw from 'fs'
import {
  parseWorkspaceIndex,
  IndexResult,
  CalendarItem,
} from './parseWorkspaceIndex.js'
import { PathItem } from './PathItem.js'
import { padEnd } from '@taskfolders/utils/native/string/padEnd'
import { Folder } from '../Folder.js'
import { WorkspaceCollections } from '../scan/WorkspaceCollections.js'
import { timeDiff } from './timeDiff.js'

import { URL } from 'node:url'
import { dc as DC, DependencyContainer } from '../../../dc.js'
const __filename = new URL('', import.meta.url).pathname

type Fox = { path; started; due }

const dimKeysApply = item => {
  for (let key in item) {
    item[key] = NodeLogger.style.dim(item[key])
  }
}

const toPathPrint = (x: PathItem) => {
  let cap = PathPadding - 5
  let pathStr = x.path.replace('/index.md', '')
  if (pathStr.length > cap) {
    pathStr = '…' + pathStr.slice(pathStr.length - cap + 1)
  }
  pathStr = `{${x.wsName ?? 'x'}}:` + pathStr
  let pathShow = NodeLogger.link({ text: pathStr, path: x.pathFull })
  return pathShow
}

const PathPadding = 50

const printOptions = {
  hideAfterDays: 7,
}

const printTable = <T>(kv: {
  rows: T[]
  log: NodeLogger
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
  log = new NodeLogger()
  fs = fsRaw

  // TODO multi index?
  index?: WorkspaceIndex

  static async create(params: SummaryHandler['params']) {
    let sut = new SummaryHandler(params)
    return sut
  }

  constructor(
    public params: { cwd: string; allWorkspaces?: boolean; showAll?: boolean },
    public dc: DependencyContainer = DC,
  ) {}

  async _getIndex() {
    let { fs } = this
    let ws = await findUpWorkspaceFolder(this.params.cwd, { fs })

    let path = ws.dataDir({ join: ['workspace-index.json'] })
    let body = fs.readFileSync(path, 'utf-8').toString()
    let index = WorkspaceIndex.fromJSON(body, { path: ws.dir })
    index.pathBaseDir = ws.dir
    index.pathIndexFile = path
    index._refreshIndex()
    return index
  }

  async _getData() {
    let res: IndexResult = {
      calendar: [],
      waiting: [],
      focus: [],
      now: [],
      active: [],
    }

    if (this.params.allWorkspaces) {
      await applyIndexForAllWorkspaces(res, { fs: this.fs })
    } else {
      let index = await this._getIndex()
      this.index = index
      let ws = await findUpWorkspaceFolder(this.params.cwd, { fs: this.fs })
      // TODO #refactor #workspace
      res = await parseWorkspaceIndex(index, {
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
    let now = new Date()
    let today_str = now.toISOString().slice(0, 10)
    let weekNumberNow = getWeek(now)

    let printSection = (x, rest = '') => log.put().put(log.style.blue(x), rest)

    log.put().put(`${today_str} : Week ${weekNumberNow} {theme name?}`).put()

    const printWaiting = (all: PathItem[]) => {
      printSection('Waiting')
      log.indent()

      let rows = all
        .map(x => {
          //let started = x.after ? x.after.toISOString().slice(0, 10) : ''
          let started = x.after_v2.date
            ? timeDiff({ date: x.after_v2.date })
            : ''
          let item = {
            // path: log.link({ text: x.path, path: x.pathFull }),
            path: toPathPrint(x),
            started,
            // due: '',
          }

          if (now < x.after_v2.date) {
            let days = differenceInCalendarDays(x.after_v2.date, now)
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
    }

    const printCalendar = () => {
      printSection('Calendar')
      log.indent()

      let byNearTimeGroups = Object.groupBy(data.calendar, item => {
        if (isThisWeek(item.date)) return 'week'
        if (
          isWithinInterval(item.date, {
            start: addDays(now, 7),
            end: addDays(now, 30),
          })
        )
          return 'month'
        if (
          isWithinInterval(item.date, {
            start: addDays(now, 30),
            end: addDays(now, 360),
          })
        )
          return 'year'

        return 'rest'
      })

      const putLine = (
        item: { title; item; date },
        //CalendarItem
      ) => {
        let date = item.date.toISOString().slice(0, 10)
        let link = NodeLogger.link({
          text: item.title,
          path: item.item.pathFull,
        })
        log.put(date, link)
      }

      let printAll = (val: { date; title; item }[]) => {
        let all = val.sort(
          (lhs, rhs) => lhs.date.getTime() - rhs.date.getTime(),
        )
        for (let item of all) {
          putLine(item)
        }
      }

      log = log.put('In a week').indent()
      if (byNearTimeGroups.week) {
        log.put('..todo')
      } else {
        log.put(log.style.dim('none'))
      }
      log = log.dedent()

      log = log.put('In a month').indent()
      if (byNearTimeGroups.month) {
        printAll(byNearTimeGroups.month)
      } else {
        log.put('..none')
      }
      log = log.dedent()

      log = log.put('In a year').indent()
      if (byNearTimeGroups.year) {
        printAll(byNearTimeGroups.year)
      } else {
        log.put('..none')
      }
      log = log.dedent()
    }

    const printNow = (all: PathItem[]) => {
      printSection('NOW')
      log.indent()
      // LOG group by inner dir
      // console.log(a1)

      type Row = { path; modified; due; after }
      let rows: Row[] = []
      all = all.sort((lhs, rhs) => rhs.mtime.getTime() - lhs.mtime.getTime())
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
    }

    const printFocus = (all: PathItem[]) => {
      printSection('Focus')
      // let rows: Fox[] = []
      let rows: { path }[] = []

      for (let pItem of all) {
        let weekFocus = getWeek(pItem.focus.date)
        let weekNow = getWeek(now)
        let row = { path: toPathPrint(pItem), week: weekFocus }
        if (weekFocus !== weekNow) {
          dimKeysApply(row)
        }
        rows.push(row)
      }
      printTable({
        rows,
        log,
        config: {
          path: { padding: PathPadding, head: '' },
          // started: { padding: 12 },
        },
      })
    }

    const printActive = (val: PathItem[]) => {
      printSection('Active')

      let all = val as PathItem[]
      let t1 = Object.groupBy(all, x => {
        if (!x.after) return 'others'
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

      all.forEach(pathItem => {
        // let mtime = x.mtime.toISOString().slice(0, 10)
        let started = ''
        if (pathItem.after_v2?.date) {
          started = timeDiff({
            date: pathItem.after_v2.date,
            color: false,
          })
        } else {
          started = pathItem.after_v2?.value ?? ''
          if (pathItem.after_v2?.type === 'reference') {
            // TODO :multi-index
            let found = this.index?.findByReference(pathItem.after_v2.value)
            if (found) {
              started = NodeLogger.link({
                text: started,
                path: found.pathFull,
              })
            }
          } else if (pathItem.after_v2?.type === 'relative') {
            started = NodeLogger.style.yellow(`rel(${started})`)
          }
        }

        // --
        let isActive = true
        if (pathItem.after_v2) {
          isActive = pathItem.after_v2.date
            ? now.getTime() > pathItem.after.getTime()
            : false

          if (pathItem.after_v2.type === 'reference') {
            if (this.index) {
              let found = this.index.findByReference(pathItem.after_v2.value)
              if (found) {
                isActive = found.done ?? false
              }
            } else {
              log.dev('todo multi index')
            }
          }
        }

        let due = pathItem.before ? timeDiff({ date: pathItem.before }) : ''

        let row = { path: toPathPrint(pathItem), started, due }

        pathItem.sections
          .filter(x => x.type === 'todo')
          .forEach(section => {
            // log.dev(section)
            let link = NodeLogger.link({
              text: 'sec',
              path: pathItem.pathFull,
              lineNumber: section.lineNumber,
              template: 'vscode',
            })
            if (section.lineNumber) {
              // TODO review #hack #dirty
              // ... just want to see title when hovering link in terminal
              // ?? just add queryParams to link utility?
              {
                // link = link.replace(
                //   `:${section.lineNumber}`,
                //   `:${section.lineNumber}?title=${section.title.replace(
                //     / /g,
                //     '_',
                //   )}`,
                // )
              }
            }
            row.path += ` ${link}`
          })

        if (!isActive) {
          let days = differenceInCalendarDays(pathItem.after_v2.date, now)
          if (days > printOptions.hideAfterDays) {
            return null
          }

          dimKeysApply(row)
        }

        rows.push(row)
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
    }

    printWaiting(data.waiting)
    printCalendar()
    printNow(data.now)
    printActive(data.active)
    printFocus(data.focus)

    let indexLabel = NodeLogger.link({
      text: 'index',
      path: this.index?.pathIndexFile,
    })
    log
      .put()
      .dev(...[indexLabel, `days-ahead=${printOptions.hideAfterDays} hidden=x`])
  }

  async execute() {
    let { log } = this
    log.info('ShowHandler.execute called', log.link({ path: __filename }))
    let res = await this._getData()

    if (this.params.showAll === true) {
      printOptions.hideAfterDays = 360
    }
    await this._printData(res)
  }
}

async function applyIndexForAllWorkspaces(
  res: {
    calendar: CalendarItem[]
    waiting: PathItem[]
    now: PathItem[]
    focus: PathItem[]
    active: PathItem[]
  },
  kv: {
    fs: typeof fsRaw
  },
) {
  let loc = WorkspaceCollections.request()
  for (let val of Object.values(loc.data.workspaces)) {
    // TODO clean
    let folder = new Folder(val.dir)
    let path = folder.dataDir({ join: ['workspace-index.json'] })

    let body = kv.fs.readFileSync(path, 'utf-8').toString()

    let index = WorkspaceIndex.fromJSON(body, { path: val.dir })

    let one = await parseWorkspaceIndex(index, {
      basePath: val.dir,
      wsName: val.sid,
    })
    Object.keys(one).forEach(key => {
      res[key] = res[key].concat(one[key])
    })
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
