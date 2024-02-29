import { expect, describe, it } from 'vitest'
import { setupLogger } from '../_test/setupLogger.js'
import { NodeLogger } from './NodeLogger.js'
import { NodeLogServer } from './NodeLogServer.js'
import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'
import * as chalk from 'chalk'

it('simple print #todo', async () => {
  let sut = setupLogger({ debug: false })
  // sut.log._debug = true

  sut.log.put('text')
  // TODO
  // sut.log.put(['text', 'b', 'c'])
})

class LoggerMock extends NodeLogger {
  acu: string[] = []
  __debug: boolean

  static hook<T, P extends keyof T>(
    obj: T,
    key: P & T[P] extends NodeLogger ? P : never,
  ) {
    let mock = new this()

    // @ts-expect-error TODO
    obj[key] = mock
    return mock
  }

  /** @deprecated just use mock? */
  static spy(log: NodeLogger) {
    let obj = new this()

    let original = log.put.bind(log)
    log.put = x => {
      obj.acu.push(x)
      if (obj.__debug) {
        console.log(chalk.magenta('screen'), '|', x)
      }
      return original(x)
    }

    return obj
  }

  text(kv: { stripAnsi?: boolean } = {}) {
    let txt = this.acu.join('\n')
    if (kv.stripAnsi) {
      txt = stripAnsiCodes(txt)
    }
    return txt
  }

  /** expect logs (like errors) */
  expect(rx: RegExp, kv: { level? } = {}) {
    throw Error('todo')
  }
}

describe('test helper', () => {
  it('spy #deprecated', async () => {
    let sut = setupLogger({ debug: false })
    let spy = LoggerMock.spy(sut.log)

    sut.log.put('one')
    sut.log.put('two')
    expect(spy.text()).toEqual('one\ntwo')

    sut.log.put(shellHyperlink({ text: 'link', path: '/tmp/foo.md' }))
    expect(spy.text()).toContain('/tmp/foo.md')
    expect(spy.text({ stripAnsi: true })).not.toContain('/tmp/foo.md')
  })

  it('capture printed text', async () => {
    let sut = setupLogger({ debug: false })
    let spy = LoggerMock.spy(sut.log)
    class Panda {
      alien: string
      log = new NodeLogger()
    }
    let pan = new Panda()

    let mock = LoggerMock.hook(pan, 'log')

    sut.log.put('one')
    sut.log.put('two')
    expect(spy.text()).toEqual('one\ntwo')

    sut.log.put(shellHyperlink({ text: 'link', path: '/tmp/foo.md' }))
    expect(spy.text()).toContain('/tmp/foo.md')
    expect(spy.text({ stripAnsi: true })).not.toContain('/tmp/foo.md')

    LoggerMock.hook(
      pan,
      // @ts-expect-error TEST
      'alien',
    )

    LoggerMock.hook(
      pan,
      // @ts-expect-error TEST
      'bogus',
    )
  })

  it('debug mode', async () => {
    let { log } = setupLogger({ debug: false })
    let spy = LoggerMock.spy(log)
    spy.__debug = true

    log.put('one')
    log.put('two')
  })
})

describe('x', () => {
  it.skip('x - collect all prints?', async () => {
    // TODO is this feat really needed?

    let server = new NodeLogServer()
    let l1 = new NodeLogger({ server })
    let l2 = new NodeLogger({ server })
    l1.put('one')
    l2.put('two')
  })
})
