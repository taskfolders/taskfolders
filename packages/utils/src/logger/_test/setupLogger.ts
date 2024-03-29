import { Logger } from '../Logger.js'
import { stripAnsiCodes } from '../../native/string/stripAnsiCodes.js'
import { LogServer } from '../LogServer.js'
import { NodeLogPrinter } from '../node/NodeLogPrinter.js'
import { MemoryScreenPrinter } from '../../screen/MemoryScreenPrinter.js'

export function setupLogger(kv: { debug? }) {
  let server = new LogServer()
  let printer = new NodeLogPrinter()
  let screen = new MemoryScreenPrinter()
  printer.screen = screen

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

  let sut = new Logger()
  // sut.screen = screen
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
