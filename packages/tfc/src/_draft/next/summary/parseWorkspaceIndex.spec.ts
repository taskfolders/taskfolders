import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { parseWorkspaceIndex, prettyNow } from './parseWorkspaceIndex.js'
import { join } from 'path/posix'
import { Logger } from '../Logger.js'
import { SummaryHandler } from './Summary.handler.js'

it('x', async () => {
  let cwd = join(process.env.HOME, 'work/fgo')
  let sut = new SummaryHandler({ cwd })
  await sut.setup()
  console.log(sut)
  let res = await parseWorkspaceIndex(sut.index, { basePath: sut.ws.dir })
})

it.skip('pretty now', async () => {
  let idx = new WorkspaceIndex({ path: '/app' })
  idx.pathIndexFile = '/app'
  idx.updateFile('action/now/ikea.md', {})
  idx.updateFile('action/now/second.md', {})
  idx.updateFile('action/now/doctor/index.md', {})
  idx.updateFile('action/now/doctor/blood-test.md', {})
  idx.updateFile('action/now/hike/nested/index.md', {})
  idx.updateFile('projects/india/action/now/plan.md', {})
  idx.updateFile('action/alien/index.md', {})
  let res = await parseWorkspaceIndex(idx, { basePath: '/app' })
  let log = new Logger()

  let r1 = prettyNow(res.now, { basePath: '/app' })
  console.log(r1)
})
