import { findWorkspaceUp } from '../WorkspaceRepo.js'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { join, relative } from 'node:path'

import { expect, describe, it } from 'vitest'
import { ScanV2Handler } from './ScanV2.handler.js'
import { StandardMetadata } from './StandardMetadata.js'

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

import { isValid } from 'date-fns'
import { parseDateHuman } from './parseDateHuman.js'
it('x', async () => {
  let res = parseDateHuman('Feb 26, 2024')
  expect(isValid(res)).toBe(true)

  res = parseDateHuman('2024-02-26')
  expect(isValid(res)).toBe(true)
})

it.skip('x y #slow #scaffold', async () => {
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

  // s1.log.info({ index })
  //sut.parse()
  //sut.findBase()
})
