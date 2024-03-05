import { expect, describe, it } from 'vitest'
import { NodeLogger } from './node/NodeLogger.js'
import { setupLogger } from './_test/setupLogger.js'
import { stripAnsiCodes } from '../native/string/stripAnsiCodes.js'

describe('log cases', () => {
  it('using level functions', async () => {
    let test = setupLogger({ debug: false })

    test.sut.dev({ fox: 1 })
    let txt = test.raw()

    // TODO #bug #review fails only in #ci
    // expect(txt).toContain('src/logger')

    txt = stripAnsiCodes(txt)
    expect(txt).toContain('DEV')
    expect(txt).toContain('fox: 1')
    expect(txt).not.toContain('src/logger')
  })

  it('using raw dsl', async () => {
    let test = setupLogger({ debug: true })
    test.sut.raw({ level: 'dev', message: 'log raw', forceLink: true })
    let ev = test.logs[0]

    expect(ev.levelName).toBe('dev')
    expect(ev.args).toEqual(['log raw'])
  })
})

it('x #scaffold', async () => {
  let sut = new NodeLogger()
  // sut.level = 'trace'
  // sut._screen.debug = true
  sut.trace('log debug')
  sut.debug('log debug')
  sut.info('log info')
  sut.dev('log dev')
  sut.warn('log dev')
  sut.error('log dev')
})

it('x log args #todo', async () => {
  let sut = new NodeLogger()
  // sut._screen.debug = true
  // sut.level = 'info'
  sut.dev('log dev')
  sut.dev({ fox: 1 })
})

it('x log function #todo', async () => {
  let { sut } = setupLogger({ debug: true })
  sut.warn('my warning', 3, { foo: 'bar' })

  // TODO bug?
  sut.raw({
    message: 'one',
    level: 'dev',
    data: { foo: 'bar' },
    // message: () => {
    //   return "some text";
    // }
  })
})

describe('use cases', () => {
  it('return first parameter', async () => {
    // WHY ease logging without creating new variables
    let sut = setupLogger({ debug: false })
    let r1 = sut.log.info({ foo: 'bar' }, 'some')
    expect(r1).toEqual({ foo: 'bar' })
  })

  it('use log level to guard message builder method', async () => {
    // WHY prevent extra code if log is not needed

    let sut = setupLogger({ debug: true })
    let spy = 0
    sut.log.raw({
      level: 'dev',
      message: () => {
        spy++
        return 'foo'
      },
    })
    expect(sut.clean()).toBe('DEV    foo')

    sut = setupLogger({ debug: false })
    sut.log.raw({
      level: 'dev',
      message: () => {
        spy++
        return ['a', 'b']
      },
    })

    expect(sut.clean()).toBe('DEV    a b')

    sut.log.raw({
      level: 'trace',
      message: () => {
        spy++
        return ['a', 'b']
      },
    })

    expect(spy).toBe(2)
  })
})
