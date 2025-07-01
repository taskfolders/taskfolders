import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from '../index/WorkspaceIndex.js'
import { parseWorkspaceIndex, prettyNow } from './parseWorkspaceIndex.js'
import { join } from 'path/posix'
import { Logger } from '../Logger.js'
import { SummaryHandler } from './Summary.handler.js'
import { PathItem } from './PathItem.js'
import { flatToListTree, Output } from './tree.js'

it('x', async () => {
  let cwd = join(process.env.HOME, 'work/fgo')
  let sut = new SummaryHandler({ cwd, allWorkspaces: true })
  let index = await sut._getIndex()
  let res = await parseWorkspaceIndex(index, {
    basePath: cwd,
    wsName: 'demo',
  })
  console.log(res)
})

it.skip('pretty now', async () => {
  let idx = new WorkspaceIndex({ path: '/app' })
  idx.pathBaseDir = '/app'
  idx.pathIndexFile = '/app'
  idx.updateFile('action/now/ikea.md', {})
  idx.updateFile('action/now/second.md', {})
  idx.updateFile('action/now/doctor/index.md', {})
  idx.updateFile('action/now/doctor/blood-test.md', {})
  idx.updateFile('action/now/hike/nested/index.md', {})
  idx.updateFile('projects/india/action/now/plan.md', {})
  idx.updateFile('action/alien/index.md', {})
  let res = await parseWorkspaceIndex(idx, { basePath: '/app', wsName: 'demo' })

  let r1 = prettyNow(res.now)
})
