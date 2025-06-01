import { WorkspaceIndex } from './WorkspaceIndex.js'

export const parseWorkspaceIndex = (index: WorkspaceIndex) => {
  let calendar = []
  // for .before and next .calendar event
  let events = []
  let waiting = []
  let now = []
  let review = []
  for (let [path, item] of Object.entries(index.data.paths)) {
    if (item.calendar) {
      item.calendar.forEach(x => {
        calendar.push({ ...x, path })
      })
    }
    if (path.includes('now')) {
      now.push({ path })
    }
    if (path.includes('waiting')) {
      waiting.push({ path })
    }
  }
  let blob = { calendar, events, waiting, now, review }
  return blob
}
