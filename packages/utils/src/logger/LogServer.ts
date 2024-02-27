import { printLogEventInBrowser } from './printLogEventInBrowser'
import { levelNumbers, LogLevelName, defaultLogLevel } from './helpers'
import { isReleaseMode } from '../runtime/isReleaseMode'
import type { LogEvent } from './Logger'

function passThreshold(kv: { level: string; threshold: string }) {
  let level_given = levelNumbers[kv.level]
  let level_threshold = levelNumbers[this.levelThresholdName]
  let isPass = level_given >= level_threshold
  if (isReleaseMode() && kv.level === 'dev') {
    isPass = false
  }
  return isPass
}

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
    // TODO #review should be done on client
    //  - passThreshold should take int
    log.levelValue ??= levelNumbers[log.levelName]

    // let location = FindCaller.whenDevelopment({ offset: 3 })
    this.printLog(log)
  }
}

const singleton: LogServer = new LogServer()
