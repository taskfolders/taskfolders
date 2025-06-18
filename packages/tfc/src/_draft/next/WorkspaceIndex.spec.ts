import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from './WorkspaceIndex.js'
import { join } from 'path/posix'

it('x', async () => {
  let sut = new WorkspaceIndex({ path: '/tmp/app' })
  sut.updateFile('one/foo.md', { sid: 'one' })
  let res = sut.get('/tmp/one/foo.md')
  // console.log(res)
})

it('x', async () => {
  let baseDir = join(process.env.HOME, 'work/fgo')
  let indexDir = join(baseDir, '_data/tf')
  let sut = await WorkspaceIndex.fromDir({ baseDir, indexDir })
  let r1 = sut.get('action/now-fgo/index.md')
  r1.mtime
  console.log(r1)
})
