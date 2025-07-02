import {
  PathIndex,
  WorkspaceIndex,
  pathIndexToPathItem,
} from '../index/WorkspaceIndex.js'
import * as fs from 'node:fs'
import { PathItem } from './PathItem.js'
import { ensureWords } from '../StandardMetadata.js'
import * as Path from 'path'
import { log } from '../../../dc.js'

export const prettyNow = (all: PathItem[]) => {
  let r1 = all
    .map(next => {
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

export type IndexResult = Awaited<ReturnType<typeof parseWorkspaceIndex>>
export type CalendarItem = { title; date: Date; item: PathItem }
export const parseWorkspaceIndex = async (
  index: WorkspaceIndex,
  { basePath, wsName },
) => {
  let calendar: CalendarItem[] = []
  // for .before and next .calendar event
  let waiting: PathItem[] = []
  let now: PathItem[] = []
  let active: PathItem[] = []

  const pathItemFromIndex = (item: PathIndex) =>
    pathIndexToPathItem({ index: item, wsName, baseDir: basePath })

  let nowDirs = index.data.items
    .filter(x => x.flags?.includes('now-dir'))
    .map(x => Path.dirname(x.pathRelative))

  let waitingDirs = index.data.items
    .filter(x => x.flags?.includes('waiting-dir'))
    .map(x => Path.dirname(x.pathRelative))

  // TODO NOW
  // log.dev('NOW... hack')

  // TODO drop?
  for (let pathIndex of index.data.items) {
    let pItem = pathItemFromIndex(pathIndex)
    // log.dev({ ...pItem })
    // console.log('..cal', pathIndex)
    if (pItem.flags.includes('skip')) continue
    if (pathIndex.calendar) {
      pathIndex.calendar.forEach(x => {
        calendar.push({
          ...x,
          path: pItem.pathRelative,
          date: new Date(x.date),
          item: pItem,
        })
      })
    }
    if (pItem.flags.includes('waiting')) {
      now.push(pItem)
    }
    if (pItem.after_v2) {
      active.push(pItem)
    }
    if (pItem.flags.includes('now')) {
      now.push(pItem)
      continue
    }

    const tryIncludeSpecialDir = (baseDirs: string[], items: PathItem[]) => {
      let foundBaseDir = baseDirs.find(x =>
        pathIndex.pathRelative.startsWith(x),
      )
      if (foundBaseDir) {
        if (pathIndex.pathRelative.endsWith('index.md')) {
          if (!baseDirs.includes(Path.dirname(pathIndex.pathRelative))) {
            let dirname = Path.dirname(pItem.pathRelative)

            let isDirectChild = Path.dirname(dirname) === foundBaseDir
            if (isDirectChild) {
              items.push(pItem)
            }
          }
        } else {
          if (baseDirs.includes(Path.dirname(pathIndex.pathRelative))) {
            items.push(pItem)
          }
        }
      }
    }

    tryIncludeSpecialDir(nowDirs, now)
    tryIncludeSpecialDir(waitingDirs, waiting)
  }

  now = prettyNow(now)

  // TODO sort
  active.sort((lhs, rhs) => {
    return lhs.after_v2.date?.getTime() - rhs.after_v2.date?.getTime()
  })

  //
  let blob = { calendar, waiting, now, active }
  // log.dev(blob)

  return blob
}
