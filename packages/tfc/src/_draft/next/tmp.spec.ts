import { findWorkspaceUp } from '../WorkspaceRepo.js'
import { TaskFoldersMarkdown } from '@taskfolders/utils/markdown'
import { join, relative } from 'node:path'

import { expect, describe, it } from 'vitest'
import { ScanV2Handler } from './ScanV2Handler.js'

it.only('x y', async () => {
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
