import { findWorkspaceUp } from '../WorkspaceRepo.js'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { join, relative } from 'node:path'

import { expect, describe, it } from 'vitest'
import { ScanV2Handler } from './ScanV2.handler.js'
import { StandardMetadata } from './StandardMetadata.js'
import { WorkspaceIndex } from './WorkspaceIndex.js'

it.skip('x', async () => {
  let data = {
    review: {
      title: 'Review',
    },
    calendar: [{ title: 'Meeting one', date: '2023-10-01' }],
    events: [{ title: 'Meeting three', date: '2023-10-01' }],
  }
  let sut = new StandardMetadata(data)
  console.log(sut.tags)
})

const parseWorkspaceIndex = (index: WorkspaceIndex) => {
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

it.only('x y #slow #scaffold', async () => {
  let dir = join(process.env.HOME, 'repos/tf-open/packages/tfc/samples/one')
  dir = join(process.env.HOME, 'repos/play/demo/one')

  let s1 = new ScanV2Handler({ dir })
  let result = await s1.execute()

  let { index } = result
  expect(
    index.find({
      uid: 'aaf32c4f-a39a-420f-bff9-ba217f5825b9',
    }),
  ).toEqual({ path: 'panda/foo.md', type: 'path' })

  expect(index.find({ uid: '1f79112d-e7ee-466e-a429-6c1b8df2495f' })).toEqual({
    path: 'one/secret.md.asc',
    type: 'section',
  })

  let two = index.data.paths['two/index.md']
  expect(two.calendar[0].date.toISOString()).toBe('2024-02-26T00:00:00.000Z')

  let blob = parseWorkspaceIndex(index)

  console.log(blob)

  // s1.log.info({ index })
  //sut.parse()
  //sut.findBase()
})
