import { expect, describe, it } from 'vitest'
import { Logger } from './Logger.js'

it('x', async () => {
  let sut = new Logger()
  sut.info('Hello world')
  sut.dev('Hello world')
  sut.debug('Hello world')
  sut.error('Hello world')
  sut.raw({ args: ['Hello world'], level: 'dev' })
})

it('x time', async () => {
  let sut = new Logger()
  sut.time()
  sut.info('one')
  sut.info('two')
  await new Promise(resolve => setTimeout(resolve, 10))
  sut.timeEnd()
})

it('x', async () => {
  let sut = new Logger()
  await sut.time(async () => {
    sut.info('one')
    sut.info('two')
    await new Promise(resolve => setTimeout(resolve, 10))
  })
})

describe('nesting', () => {
  it('group', async () => {
    let sut = new Logger()
    sut.put('one')
    sut.group()
    console.log(sut)

    sut.put('two')
    sut.groupEnd()
    sut.put('three')
  })

  it.skip('indent', async () => {})
})

it.skip('stack trace sanitization', async () => {
  let sut = new Logger()
})

it.only('x data', async () => {
  let sut = new Logger()
  sut.data = { foo: 'bar', baz: 123 }
  sut.info('hi')
})
