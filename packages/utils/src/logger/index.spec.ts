import { expect, describe, it } from 'vitest'
import { Logger } from './Logger.js'
import { LogServer } from './LogServer.js'

it('x', async () => {
  let log = new Logger()
  log.server = new LogServer()
  log.dev('hi')
})
