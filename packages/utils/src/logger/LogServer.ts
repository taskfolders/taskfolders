import { BasicLogPrinter } from './BasicLogPrinter.js'
import { levelNumbers, defaultLogLevel, LogLevelName } from './helpers.js'
import type { LogEvent } from './Logger.js'
import { passThreshold } from './passThreshold.js'

const globalKey = Symbol('taskfolders.com:utils:LogServer')

export class LogServer {
  levelThresholdName = defaultLogLevel()

  printer = new BasicLogPrinter()

  static request(): LogServer {
    global[globalKey] ??= new LogServer()
    return global[globalKey]
  }

  constructor(kv: { level?: LogLevelName } = {}) {
    this.levelThresholdName = kv.level ?? defaultLogLevel()
  }

  handleLog(log: LogEvent) {
    let pass = passThreshold({
      level: log.levelName,
      threshold: this.levelThresholdName,
    })
    // console.log({
    //   pass,
    //   logLevel: log.levelName,
    //   threshold: this.levelThresholdName,
    // })

    if (!pass) return

    if (log.levelName === 'dev' && process.env.TASKFOLDERS_LOGGER_DEV !== '1') {
      return
    }

    // TODO #review should be done on client
    //  - passThreshold should take int
    log.levelValue ??= levelNumbers[log.levelName]

    // let location = FindCaller.whenDevelopment({ offset: 3 })
    if (log.messageBuilder) {
      let out = log.messageBuilder()
      if (Array.isArray(out)) {
        log.args = out
      } else {
        log.args = [out]
      }
    }

    this.printer.printLogEvent(log)
  }
}
