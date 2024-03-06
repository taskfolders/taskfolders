import { printLogEventInNode } from './NodeLogPrinter.js'
import { setupLogger } from '../_test/setupLogger.js'
import { expect, describe, it } from 'vitest'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'

let longLine =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
let longParagraph = ` 
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`

describe('x', () => {
  it('x', async () => {
    let { sut } = setupLogger({ debug: true })
    sut.error('foo')

    sut.name = 'Panda'

    sut.info('foo')
  })

  it('x', async () => {
    let { sut } = setupLogger({ debug: true })
    sut.info('some text', { fox: 1 })
    sut.info({ fox: 1 }, 'some text')

    // TODO
    sut.info({ fox: 1 }, { fox: 2 })
  })

  it('x', async () => {
    let { sut } = setupLogger({ debug: true })
    sut.info({ fox: 1 })
    sut.info('some text', { fox: 1 })
    sut.info({
      fox: 1,
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      delta: 3,
    })
    sut.info([1, 2, 3])
    sut.info({ one: { two: { three: { four: { five: { six: 7 } } } } } }, null)
    sut.info(function foo() {})
    sut.info(() => {})
  })

  describe('objects', () => {
    it('inspect', async () => {
      class Panda {
        [Symbol.for('nodejs.util.inspect.custom')]() {
          return `<Panda custom-inspect>`
        }
      }
      let { sut } = setupLogger({ debug: true })
      let obj = new Panda()
      sut.info(obj)
      sut.info({ obj })
      sut.info('some text', obj)
      sut.info('some text', { obj })
      sut.info({ obj }, null, { inspect: false })
    })
  })

  it('no value', async () => {
    let { sut } = setupLogger({ debug: true })
    sut.info(null)
    sut.info(undefined)
  })

  it('long text #todo', async () => {
    let { sut } = setupLogger({ debug: false })
    sut.info(longLine)
    sut.info(longParagraph)
  })

  it('print short logs in one line', async () => {
    let { sut, screen } = setupLogger({ debug: false })

    sut.info('one', 2, { foo: 'bar' })

    let txt = stripAnsiCodes(screen.text())
    expect(txt).toBe("INFO   one 2 { foo: 'bar' }")
  })
})
