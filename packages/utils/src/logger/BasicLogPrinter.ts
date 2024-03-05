import type { LogEvent } from './Logger.js'
import { LogPrinter } from './LogPrinter.js'

export class BasicLogPrinter extends LogPrinter {
  printLogEvent(ev: LogEvent) {
    let parts = [ev.levelName.toUpperCase().padEnd(5), '|', ...ev.args]
    console.log(...parts)
  }
}
