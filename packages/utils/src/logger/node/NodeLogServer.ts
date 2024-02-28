import { BaseLogServer } from '../BaseLogServer.js'
import { printLogEventInNode } from './printLogEventInNode.js'
import { LogEvent } from '../BaseLogger.js'
import { ScreenPrinter } from '../../screen/ScreenPrinter.js'

export class NodeLogServer extends BaseLogServer {
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

export const singleton: BaseLogServer = new NodeLogServer()
