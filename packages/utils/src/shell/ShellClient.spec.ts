import { expect, describe, it } from 'vitest'

import { ShellClient, ShellError } from './ShellClient.js'
import { ShellClientMock } from './ShellClientMock.js'

it.skip('x query', async () => {
  //let res = await ShellCommand.query('pwd')
})

it('x - inherit #todo', async () => {
  let res = await ShellClient.execute('pwd', {
    inherit: true,
    cwd: '/tmp',
    mustMock: false,
  })
  // console.log(res)
})

it('x echo #todo ', async () => {
  let res = await ShellClient.execute('pwd', {
    echo: true,
    cwd: '/tmp',
    mustMock: false,
  })
  // console.log(res)
})

describe('executions', () => {
  //
  it('x echo #todo ', async () => {
    let res = await ShellClient.execute('pwd', {
      echo: true,
      cwd: '/tmp',
      mustMock: false,
    })
    // console.log(res)
  })
})

describe('testing', () => {
  it('guard .execute under test', async () => {
    let sut = new ShellClient()

    let error = await sut.execute('pwd').catch(e => e)
    expect(ShellError.mustMock.is(error)).toBe(true)

    let res = await sut.execute('pwd', { mustMock: false })
  })

  it('x', async () => {
    let sut = new ShellClientMock()
    sut.execute('pwd')
    expect(sut.calls[0].request.command).toBe('pwd')
  })
})
