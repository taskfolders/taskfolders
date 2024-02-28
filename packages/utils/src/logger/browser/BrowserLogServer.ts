import { printLogEventInBrowser } from '../printLogEventInBrowser.js'
import { BaseLogServer } from '../BaseLogServer.js'

export class BrowserLogServer extends BaseLogServer {
  printLog: (LogEvent) => void = printLogEventInBrowser
  static request() {
    return singleton
  }
}

export const singleton: BaseLogServer = new BrowserLogServer()
