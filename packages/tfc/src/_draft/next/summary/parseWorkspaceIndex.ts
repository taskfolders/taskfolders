import { PathIndex, WorkspaceIndex } from '../WorkspaceIndex.js'
import * as fs from 'node:fs'
import { PathItem } from './PathItem.js'
import { ensureWords } from '../StandardMetadata.js'
import * as Path from 'path'

export const prettyNow = (all: { path }[], kv: { basePath }) => {
  let { basePath } = kv
  let r1 = all
    .map(item => {
      let next = new PathItem()
      next.path = item.path
      next.base = basePath

      if (!fs.existsSync(next.pathFull)) {
        console.error('File does not exist', next.pathFull)

        return null
      }

      let parts = next.path.split('/')
      next.dir = parts.slice(0, 1).join('/')
      if (next.dir.endsWith('.md')) {
        next.dir = null
      }

      // x.show = log.link({ path: x.path })
      return next
    })
    .filter(Boolean)

  return r1
}

const ungroup = x => Object.values<any>(x).flat()

export const parseWorkspaceIndex = async (
  index: WorkspaceIndex,
  { basePath },
) => {
  let calendar: { title; date: Date }[] = []
  // for .before and next .calendar event
  let waiting: PathItem[] = []
  let now: PathItem[] = []
  let active: PathItem[] = []

  const pathItemFromIndex = (
    item: PathIndex,
    // TODO drop
    /** @deprecated */
    path?,
  ) => {
    let next = new PathItem()
    next.base = basePath
    next.path = path ?? item.pathRelative
    next.after = item.after
    next.before = item.before
    next.tags = ensureWords(item.tags)
    next.uid = item.uid
    next.sid = item.sid
    next.flags = ensureWords(item.flags)
    return next
  }

  for (let [path, item] of Object.entries(index.data.paths)) {
    if (item.calendar) {
      item.calendar.forEach(x => {
        calendar.push({ ...x, path, date: new Date(x.date) })
      })
    }
    let pItem = pathItemFromIndex(item, path)
    if (path.endsWith('.md')) {
      if (item.after) {
        active.push(pItem)
      }
    }

    if (pItem.flags.includes('now')) {
      now.push(pItem)
    }
    if (pItem.flags.includes('waiting')) {
      now.push(pItem)
    }
  }

  let nowDirs = index.data.items
    .filter(x => x.flags?.includes('now-dir'))
    .map(x => Path.dirname(x.pathRelative))

  let waitingDirs = index.data.items
    .filter(x => x.flags?.includes('waiting-dir'))
    .map(x => Path.dirname(x.pathRelative))

  for (let item of index.data.items) {
    let pItem = pathItemFromIndex(item)

    const runInclude = (all: string[], acu: PathItem[]) => {
      if (all.find(x => item.pathRelative.startsWith(x))) {
        if (item.pathRelative.endsWith('index.md')) {
          if (!all.includes(Path.dirname(item.pathRelative))) {
            acu.push(pItem)
          }
        } else {
          if (all.includes(Path.dirname(item.pathRelative))) {
            acu.push(pItem)
          }
        }
      }
    }

    runInclude(nowDirs, now)
    runInclude(waitingDirs, waiting)
  }

  //
  now = prettyNow(now, { basePath })
  active.sort((lhs, rhs) => {
    return lhs.after.getTime() - rhs.after.getTime()
  })

  //
  let blob = { calendar, waiting, now, active }

  return blob
}
