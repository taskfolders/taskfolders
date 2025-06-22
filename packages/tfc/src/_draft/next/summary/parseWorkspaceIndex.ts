import { WorkspaceIndex } from '../WorkspaceIndex.js'
import * as fs from 'node:fs'
import { PathItem } from './PathItem.js'

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
      let idx = parts.findIndex(x => x.match(/now/)) + 1
      let afterNow = parts[idx] ?? parts[0]
      // next.path = join(basePath, ...parts)

      parts = parts.slice(idx)
      // next.dir = parts.slice(0, idx - 1).join('/')
      next.dir = parts.slice(0, 1).join('/')
      if (next.dir.endsWith('.md')) {
        next.dir = null
      }

      if (!afterNow.endsWith('.md')) {
        parts = parts.slice(0, 1)
        next.show = parts.join('/')
      } else {
        next.show = parts.join('/')
      }

      // x.show = log.link({ path: x.path })
      return next
    })
    .filter(Boolean)

  let group = Object.groupBy(r1, x => x.dir)
  for (let [key, val] of Object.entries(group)) {
    if (key === 'null') continue

    let next = val.sort((lhs, rhs) => lhs.path.length - rhs.path.length).at(0)

    // @ts-expect-error TODO
    group[key] = next
  }

  r1 = ungroup(group)

  return r1
}

const ungroup = x => Object.values<any>(x).flat()

export const parseWorkspaceIndex = (index: WorkspaceIndex, { basePath }) => {
  let calendar: { title; date: Date }[] = []
  // for .before and next .calendar event
  let waiting = []
  let now: PathItem[] = []
  let review = []
  for (let [path, item] of Object.entries(index.data.paths)) {
    if (item.calendar) {
      item.calendar.forEach(x => {
        calendar.push({ ...x, path, date: new Date(x.date) })
      })
    }
    if (path.includes('now')) {
      let ma = path.match(/action\/now.*\/(.*)/)
      if (ma) {
        let parts = path.split('/')
      }

      let next = new PathItem()
      next.path = path
      now.push(next)
    }
    if (path.includes('waiting')) {
      waiting.push({ path })
    }
  }

  now = prettyNow(now, { basePath })
  let blob = { calendar, waiting, now, review }

  return blob
}
