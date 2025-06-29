import { PathIndex, WorkspaceIndex } from '../WorkspaceIndex.js'
import * as fs from 'node:fs'
import { PathItem } from './PathItem.js'
import { ensureWords } from '../StandardMetadata.js'
import * as Path from 'path'

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

export const parseWorkspaceIndex = async (
  index: WorkspaceIndex,
  { basePath, wsName },
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
    let next = new PathItem({ pathRelative: path ?? item.pathRelative })
    next.wsName = wsName
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

  let nowDirs = index.data.items
    .filter(x => x.flags?.includes('now-dir'))
    .map(x => Path.dirname(x.pathRelative))

  let waitingDirs = index.data.items
    .filter(x => x.flags?.includes('waiting-dir'))
    .map(x => Path.dirname(x.pathRelative))

  for (let pathIndex of index.data.items) {
    let pItem = pathItemFromIndex(pathIndex)
    if (pItem.flags.includes('skip')) continue
    if (pathIndex.calendar) {
      pathIndex.calendar.forEach(x => {
        calendar.push({
          ...x,
          path: pItem.pathRelative,
          date: new Date(x.date),
        })
      })
    }
    if (pItem.flags.includes('waiting')) {
      now.push(pItem)
    }
    if (pItem.after) {
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

  active.sort((lhs, rhs) => {
    return lhs.after.getTime() - rhs.after.getTime()
  })

  //
  let blob = { calendar, waiting, now, active }

  return blob
}
