import { NodeLogger } from '../node/NodeLogger.js'
import { NodeLogServer } from '../node/NodeLogServer.js'
import { printLogEventInNode } from '../node/printLogEventInNode.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'

export function setupLogger(kv: { debug? }) {
  let screen = new ScreenPrinter()
  screen.debug = kv.debug

  let server = NodeLogServer.request()
  server.printLog = printLogEventInNode({ screen })

  let logs = []
  let orig = server.handleLog
  server.handleLog = ev => {
    logs.push(ev)
    return orig.call(server, ev)
  }

  let sut = new NodeLogger()
  sut.server = server
  sut.server.levelThresholdName = 'info'

  return { sut, screen, logs }
}
