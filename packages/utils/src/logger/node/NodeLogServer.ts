import { LogServer } from '../LogServer.js'
import { printLogEventInNode } from './printLogEventInNode.js'
import { LogEvent } from '../Logger.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'

export class NodeLogServer extends LogServer {
  screen = new ScreenPrinter()

  printLog: (LogEvent) => void = (ev: LogEvent) => {
    printLogEventInNode({ screen: this.screen })(ev)
  }
  // printLog2(ev: LogEvent) {
  //   printLogEventInNode({ screen: this.screen })(ev)
  // }

  static request() {
    return singleton
  }
}

export const singleton: LogServer = new NodeLogServer()
