import { expect, describe, it } from 'vitest'

import { ShellClient, ShellError } from './ShellClient.js'
import { ShellClientMock } from './test/ShellClientMock.js'

it.skip('x query', async () => {
  //let res = await ShellCommand.query('pwd')
})

it('x - inherit #todo', async () => {
  let res = await ShellClient.command('pwd', {
    inherit: true,
    cwd: '/tmp',
    mustMock: false,
  })
  // console.log(res)
})

it('x echo #todo ', async () => {
  let res = await ShellClient.command('pwd', {
    echo: true,
    cwd: '/tmp',
    mustMock: false,
  })
  // console.log(res)
})

describe('execute styles', () => {
  describe('raw execute', () => {
    it('ok', async () => {
      let res = await ShellClient.create().execute('pwd', { mustMock: false })
      await res.done()
      expect(res.stdout.toString()).toContain('packages/utils')
      expect(res.output.toString()).toContain('packages/utils')
    })

    it('fail', async () => {
      let res = await ShellClient.create().execute('ls bogus', {
        mustMock: false,
      })
      let error = await res.done().catch(e => e)
      expect(ShellError.execute.is(error)).toBe(true)
      console.log(error)
    })
  })

  it('query', async () => {
    let res = await ShellClient.create().query('pwd', { mustMock: false })
    expect(res).toContain('packages/utils')
  })

  it('command', async () => {
    let res = await ShellClient.create().command('pwd', { mustMock: false })
  })
})

describe('x', () => {
  it('x echo #todo ', async () => {
    let res = await ShellClient.create().command('pwd', {
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

    let error = await sut.command('pwd').catch(e => e)
    expect(ShellError.mustMock.is(error)).toBe(true)

    let res = await sut.command('pwd', { mustMock: false })
  })

  it('x', async () => {
    let sut = new ShellClientMock()
    sut.command('pwd')
    expect(sut.calls[0].request.command).toBe('pwd')
  })
})
