import { expect, describe, it } from 'vitest'
import { NodeLogger } from './NodeLogger.js'
import dedent from 'dedent'

it('x', async () => {
  let sut = new NodeLogger()
  sut.info('Hello world')
  sut.dev('Hello world')
  sut.debug('Hello world')
  sut.error('Hello world')
  sut.raw({ args: ['Hello world'], level: 'dev' })
})

it('x time', async () => {
  let sut = new NodeLogger()
  sut.time()
  sut.info('one')
  sut.info('two')
  await new Promise(resolve => setTimeout(resolve, 10))
  sut.timeEnd()
})

it('x', async () => {
  let sut = new NodeLogger()
  await sut.time(async () => {
    sut.info('one')
    sut.info('two')
    await new Promise(resolve => setTimeout(resolve, 10))
  })
})

describe('nesting', () => {
  it('group', async () => {
    let sut = new NodeLogger()
    sut.put('one')
    sut.group()

    sut.put('two')
    sut.groupEnd()
    sut.put('three')
  })

  it('indent', async () => {
    let sut = new NodeLoggerTesting()
    sut.put('one')
    let child = sut.indent()

    child.put('two')
    sut.put('two')

    sut.dedent()
    sut.put('three')
  })
})

class NodeLoggerTesting extends NodeLogger {
  echo = false
  _outputs = []
  _rawPrint(line: string): void {
    this._outputs.push(line)
    if (this.echo) console.log(line)
  }
  clone() {
    let next = new NodeLoggerTesting()
    next.options = JSON.parse(JSON.stringify(this.options))
    next._outputs = this._outputs
    return next
  }
  output() {
    return this._outputs.join('\n')
  }
}

it('indent', async () => {
  let sut = new NodeLoggerTesting()
  sut.put('one')
  let child = sut.indent()

  child.put('two')
  sut.put('two')

  sut.dedent()
  sut.put('three')
  expect(sut.output()).toBe(dedent`
    one
      two
    two
    three`)
})

it.skip('stack trace sanitization', async () => {
  let sut = new NodeLogger()
})

it('x data', async () => {
  let sut = new NodeLogger()
  sut.data = { foo: 'bar', baz: 123 }
  sut.info('hi')
})
