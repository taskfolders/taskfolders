import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { parseWorkspaceIndex, prettyNow } from './parseWorkspaceIndex.js'
import { join } from 'path/posix'
import { Logger } from '../Logger.js'

it.only('pretty now', async () => {
  let idx = new WorkspaceIndex({ path: '/app' })
  idx.path = '/app'
  idx.updateFile('action/now/ikea.md', {})
  idx.updateFile('action/now/second.md', {})
  idx.updateFile('action/now/doctor/index.md', {})
  idx.updateFile('action/now/doctor/blood-test.md', {})
  idx.updateFile('action/now/hike/nested/index.md', {})
  idx.updateFile('projects/india/action/now/plan.md', {})
  idx.updateFile('action/alien/index.md', {})
  let res = parseWorkspaceIndex(idx)
  let log = new Logger()

  let r1 = prettyNow(res.now, { basePath: '/app' })
  console.log(r1)
})
