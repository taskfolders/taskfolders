import { printLogEventInBrowser } from './printLogEventInBrowser'
import { levelNumbers, LogLevelName, defaultLogLevel } from './helpers'
import { isReleaseMode } from '../runtime/isReleaseMode'
import type { LogEvent } from './Logger'
import type { ScreenPrinter } from '../screen/ScreenPrinter'
import { FindCaller } from '../stack/locate/FindCaller'

export class LogServer {
  levelThresholdName = defaultLogLevel()

  printLog: (LogEvent) => void = printLogEventInBrowser

  static request() {
    return singleton
  }

  private passThreshold(levelName: LogLevelName) {
    let level_given = levelNumbers[levelName]
    let level_threshold = levelNumbers[this.levelThresholdName]
    let isPass = level_given >= level_threshold
    if (isReleaseMode() && levelName === 'dev') {
      isPass = false
    }
    return isPass
  }

  handleLog(log: LogEvent) {
    if (!this.passThreshold(log.levelName)) {
      return
    }
    // let location = FindCaller.whenDevelopment({ offset: 3 })
    this.printLog(log)
  }
}

const singleton: LogServer = new LogServer()
