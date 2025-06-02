import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from './WorkspaceIndex.js'
import { parseWorkspaceIndex } from './parseWorkspaceIndex.js'
import { join } from 'path/posix'

it.only('x', async () => {
  let idx = new WorkspaceIndex()
  idx.updateFile('action/now/ikea.md', {})
  idx.updateFile('action/now/doctor/index.md', {})
  idx.updateFile('action/now/hike/nested/index.md', {})
  idx.updateFile('projects/india/action/now/plan.md', {})
  idx.updateFile('action/alien/index.md', {})
  let res = parseWorkspaceIndex(idx)
  let r1 = res.now.map(x => {
    let parts = x.path.split('/')
    let idx = parts.findIndex(x => x.match(/now/)) + 1
    let afterNow = parts[idx]
    if (!afterNow.endsWith('.md')) {
      parts = parts.slice(0, idx + 1)
    }
    x.path = parts.join('/')
    return x
  })
  console.log(r1)
})
