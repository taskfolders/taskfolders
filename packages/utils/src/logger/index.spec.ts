import { expect, describe, it } from 'vitest'
import { Logger } from './Logger.js'
import { LogServer } from './LogServer.js'
// import { $dev } from './index.js'

it('x', async () => {
  let log = new Logger()
  log.server = new LogServer()
  log.dev('hi')
})

it.skip('x #live', async () => {
  // $dev('hello world')
})
