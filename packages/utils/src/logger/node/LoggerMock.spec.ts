import { expect, describe, it } from 'vitest'
import { setupLogger } from '../_test/setupLogger.js'
import { Logger } from '../Logger.js'
import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { LoggerMock } from './LoggerMock.js'

class Panda {
  alien: string
  log = new Logger()
}

it('spy .put printed text #deprecated', async () => {
  let sut = setupLogger({ debug: false })
  let spy = LoggerMock.spy(sut.log)

  sut.log.put('one')
  sut.log.put('two')
  expect(spy.text()).toEqual('one\ntwo')

  sut.log.put(shellHyperlink({ text: 'link', path: '/tmp/foo.md' }))
  expect(spy.text()).toContain('/tmp/foo.md')
  expect(spy.text({ stripAnsi: true })).not.toContain('/tmp/foo.md')
})

it.skip('capture printed text #broken #bug', async () => {
  let pan = new Panda()

  let mock = LoggerMock.hook(pan, 'log')

  pan.log.put('one')
  pan.log.put(shellHyperlink({ text: 'link', path: '/tmp/foo.md' }))

  expect(mock.text()).toContain('one')
  expect(mock.text()).toContain('/tmp/foo.md')
  expect(mock.text({ stripAnsi: true })).not.toContain('/tmp/foo.md')

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

it.skip('debug mode #manual', async () => {
  // TODO with mock?
  let { log } = setupLogger({ debug: false })
  let spy = LoggerMock.spy(log)
  spy._debug = true

  log.put('one')
  log.put('two')

  let pan = new Panda()
  let mock = LoggerMock.hook(pan, 'log', { debug: true })
  pan.log.put('one')
})
