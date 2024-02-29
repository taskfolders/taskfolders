import { NodeLogger } from '../node/NodeLogger.js'
import { NodeLogServer } from '../node/NodeLogServer.js'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'

export function setupLogger(kv: { debug? }) {
  let server = NodeLogServer.request() as NodeLogServer
  server.screen.debug = kv.debug
  //server.printLog = printLogEventInNode({ screen })

  let logs = []
  let orig = server.handleLog
  server.handleLog = ev => {
    logs.push(ev)
    return orig.call(server, ev)
  }

  let sut = new NodeLogger()
  sut.server = server
  sut.server.levelThresholdName = 'info'

  let { screen } = server
  return {
    sut,
    log: sut,
    screen,
    logs,
    raw() {
      return screen.text()
    },
    clean() {
      return stripAnsiCodes(this.raw())
    },
  }
}
