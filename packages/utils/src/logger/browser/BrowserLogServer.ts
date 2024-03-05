import { printLogEventInBrowser } from '../printLogEventInBrowser.js'
import { LogServer } from '../LogServer.js'
import { LogEvent } from '../Logger.js'

export class BrowserLogServer extends LogServer {
  printLog = (ev: LogEvent) => {
    printLogEventInBrowser(ev)
  }

  static request() {
    // console.log('request', singleton.levelThresholdName)
    return singleton
  }
}

export const singleton: LogServer = new BrowserLogServer()
