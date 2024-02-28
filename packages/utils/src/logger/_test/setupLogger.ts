import { Logger } from '../Logger.js'
import { LogServer } from '../LogServer.js'
import { printLogEventInNode } from '../_node/printLogEventInNode.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'

export function setupLogger(kv: { debug? }) {
  let screen = new ScreenPrinter()
  screen.debug = kv.debug

  let server = LogServer.request()
  server.printLog = printLogEventInNode({ screen })

  let logs = []
  let orig = server.handleLog
  server.handleLog = ev => {
    logs.push(ev)
    return orig.call(server, ev)
  }

  let sut = new Logger()
  sut.server = server
  sut.server.levelThresholdName = 'info'

  return { sut, screen, logs }
}
