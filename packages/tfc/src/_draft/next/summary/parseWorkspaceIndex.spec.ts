import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from '../index/WorkspaceIndex.js'
import { parseWorkspaceIndex, prettyNow } from './parseWorkspaceIndex.js'
import { join } from 'path/posix'
import { SummaryHandler } from './Summary.handler.js'
import { PathItem } from './PathItem.js'
import { flatToListTree, Output } from './tree.js'

it('x #scaffold #live', async () => {
  let cwd = join(process.env.HOME, 'work/fgo')
  let sut = new SummaryHandler({ cwd, allWorkspaces: true })
  let index = await sut._getIndex()
  let res = await parseWorkspaceIndex(index, {
    basePath: cwd,
    wsName: 'demo',
  })
  console.log(res)
})

import { Volume, vol } from 'memfs'
import { memoryFilesystem } from './memoryFilesystem.js'
it.only('pretty now', async () => {
  let fsMem = memoryFilesystem({
    '/app/action/now/ikea.md': 'flags: now\n\nhi',
    '/app/action/now/second.md': '',
    '/app/action/now/doctor/index.md': '',
    '/app/action/now/doctor/blood-test.md': '',
    '/app/action/now/hike/nested/index.md': '',
    '/app/projects/india/action/now/plan.md': 'fox: 1',
    '/app/action/alien/index.md': '',
  })

  let idx = new WorkspaceIndex({ path: '/app' })
  idx.fs = fsMem
  idx.pathBaseDir = '/app'
  idx.pathIndexFile = '/app'
  idx.updateFile('action/now/ikea.md', {})
  // idx.updateFile('action/now/second.md', {})
  // idx.updateFile('action/now/doctor/index.md', {})
  // idx.updateFile('action/now/doctor/blood-test.md', {})
  // idx.updateFile('action/now/hike/nested/index.md', {})
  // idx.updateFile('projects/india/action/now/plan.md', {})
  // idx.updateFile('action/alien/index.md', {})
  let res = await parseWorkspaceIndex(idx, { basePath: '/app', wsName: 'demo' })

  let r1 = prettyNow(res.now)
  $dev(res)
  $dev(idx.data.paths)
})
