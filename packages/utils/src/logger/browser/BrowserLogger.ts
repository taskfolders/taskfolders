import { Logger } from '../Logger.js'
import { BrowserLogServer } from './BrowserLogServer.js'

export class BrowserLogger extends Logger {
  server = BrowserLogServer.request()
}
