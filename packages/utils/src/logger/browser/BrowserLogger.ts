import { BaseLogger } from '../BaseLogger.js'
import { BrowserLogServer } from './BrowserLogServer.js'

export class BrowserLogger extends BaseLogger {
  server = BrowserLogServer.request()
}
