import { NodeLogger } from '../node/NodeLogger.js'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'
import { LogServer } from '../LogServer.js'
import { NodeLogPrinter } from '../node/printLogEventInNode.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'

export function setupLogger(kv: { debug? }) {
  let server = new LogServer()
  let printer = new NodeLogPrinter()
  let { screen } = printer

  server.printer = printer
  screen.debug = true
  // console.log(screen.debug)
  // console.log({ debug: screen.debug, kv, al: printer.screen.debug })

  // let scr = new ScreenPrinter()

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
