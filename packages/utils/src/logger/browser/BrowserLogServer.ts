import { printLogEventInBrowser } from '../printLogEventInBrowser.js'
import { BaseLogServer } from '../BaseLogServer.js'
import { LogEvent } from '../BaseLogger.js'

export class BrowserLogServer extends BaseLogServer {
  printLog = (ev: LogEvent) => {
    printLogEventInBrowser(ev)
  }

  static request() {
    // console.log('request', singleton.levelThresholdName)
    return singleton
  }
}

export const singleton: BaseLogServer = new BrowserLogServer()
