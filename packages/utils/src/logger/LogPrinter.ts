import type { LogEvent } from './Logger.js'

export abstract class LogPrinter {
  abstract printLogEvent(ev: LogEvent)
}
