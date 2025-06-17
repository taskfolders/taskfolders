import { expect, describe, it } from 'vitest'
import { SummaryHandler } from './Summary.handler.js'
import { WorkspaceIndex } from '../WorkspaceIndex.js'
import { parseWorkspaceIndex } from './parseWorkspaceIndex.js'

it('x', async () => {
  let sut = new SummaryHandler({ cwd: '/app' })
  sut.fetchSummaryData = async () => {
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
    return res
  }
  let res = sut.execute()
  // sut.printFolders()
  console.log(res)
})
