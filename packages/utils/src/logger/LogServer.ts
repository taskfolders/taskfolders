import { printLogEventInBrowser } from './printLogEventInBrowser.js'
import { levelNumbers, LogLevelName, defaultLogLevel } from './helpers.js'
import { isReleaseMode } from '../runtime/isReleaseMode.js'
import type { LogEvent } from './Logger.js'
import { passThreshold } from './passThreshold.js'

export class LogServer {
  levelThresholdName = defaultLogLevel()

  printLog: (LogEvent) => void = printLogEventInBrowser

  static request() {
    return singleton
  }

  handleLog(log: LogEvent) {
    let pass = passThreshold({
      level: log.levelName,
      threshold: this.levelThresholdName,
    })
    if (!pass) return

    if (log.levelName === 'dev' && process.env.TASKFOLDERS_LOGGER_DEV !== '1') {
      return
    }

    // TODO #review should be done on client
    //  - passThreshold should take int
    log.levelValue ??= levelNumbers[log.levelName]

    // let location = FindCaller.whenDevelopment({ offset: 3 })
    this.printLog(log)
  }
}

const singleton: LogServer = new LogServer()
