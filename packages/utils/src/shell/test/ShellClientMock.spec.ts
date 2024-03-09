import { expect, describe, it } from 'vitest'
import { ShellClient } from '../ShellClient.js'
import { ShellClientMock } from './ShellClientMock.js'

it('x', async () => {
  let sh = new ShellClient({ cwd: '/tmp' })
  let sut = ShellClientMock.fromClient(sh)
  let res = await sut.query('ls', { mustMock: false })
})
