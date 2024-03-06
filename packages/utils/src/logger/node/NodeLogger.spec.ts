import { expect, describe, it } from 'vitest'
import { setupLogger } from '../_test/setupLogger.js'
import { Logger as NodeLogger } from '../Logger.js'
import { shellHyperlink } from '../../screen/shellHyperlink/shellHyperlink.js'
import { LoggerMock } from './LoggerMock.js'

it('simple print #todo', async () => {
  let sut = setupLogger({ debug: false })
  // sut.log._debug = true

  sut.log.put('text')
  // TODO
  // sut.log.put(['text', 'b', 'c'])
})

describe.skip('x', () => {
  it('x #review how to test a logger', async () => {
    let server //= new NodeLogServer({ level: 'info' })
    server.screen.debug = true
    let sut = new NodeLogger()
    sut.info('x')
  })

  it.skip('x - collect all prints?', async () => {
    // TODO is this feat really needed?

    let server //= new NodeLogServer()
    let l1 = new NodeLogger()
    let l2 = new NodeLogger()
    l1.put('one')
    l2.put('two')
  })
})
