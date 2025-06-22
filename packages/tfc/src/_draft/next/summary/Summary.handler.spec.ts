import { expect, describe, it } from 'vitest'
import { SummaryHandler } from './Summary.handler.js'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { parseWorkspaceIndex } from './parseWorkspaceIndex.js'
import { join } from 'node:path'

it('x', async () => {
  let sut = new SummaryHandler({ cwd: '/app' })
  sut._getData = async () => {
    let idx = new WorkspaceIndex({ path: '/app' })
    idx.pathIndexFile = '/app'
    idx.updateFile('action/now/ikea.md', {})
    idx.updateFile('action/now/second.md', {})
    idx.updateFile('action/now/doctor/index.md', {})
    idx.updateFile('action/now/doctor/blood-test.md', {})
    idx.updateFile('action/now/hike/nested/index.md', {})
    idx.updateFile('projects/india/action/now/plan.md', {})
    idx.updateFile('action/alien/index.md', {})
    let res = parseWorkspaceIndex(idx, { basePath: '/app' })
    return res
  }
  let res = sut.execute()
  // sut.printFolders()
  console.log(res)
})

it.only('x', async () => {
  let cwd = join(process.env.HOME, 'work/fgo')
  let sut = new SummaryHandler({ cwd })
  let res = await sut.execute()
})
