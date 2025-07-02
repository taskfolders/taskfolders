import { expect, describe, it } from 'vitest'
import { WorkspaceIndex } from './WorkspaceIndex.js'
import { join } from 'path/posix'

// TODO mock stat.mtime
it.skip('x', async () => {
  let sut = new WorkspaceIndex({ path: '/tmp/app' })
  sut.pathBaseDir = '/tmp'
  sut.updateFile('one/foo.md', { sid: 'one' })
  let res = sut.get('/tmp/one/foo.md')
  // console.log(res)
})

it('x read one #scaffold #live', async () => {
  let baseDir = join(process.env.HOME, 'work/fgo')
  let indexDir = join(baseDir, '_data/tf')
  let sut = await WorkspaceIndex.fromDir({ baseDir, indexDir })
  // let r1 = sut.get('action/now-fgo/index.md')
  let r1 = sut.get('demo/index.md')
  r1.mtime
  let r2 = sut.data
  // console.log({ ...r1 })
  console.log(sut.data.paths['demo/index.md'])
})

it.only('x process one #scaffold #live', async () => {
  let path = join(process.env.HOME, 'work/fgo')
  let sut = new WorkspaceIndex({ path })
  sut.pathBaseDir = path
  sut.updateFile('demo/index.md', { sid: 'one', after: 2026 })

  console.log(sut.data)
  // console.log(sut.toJSON())
})
