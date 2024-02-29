import { levelNumbers, defaultLogLevel } from './helpers.js'
import type { LogEvent } from './BaseLogger.js'
import { passThreshold } from './passThreshold.js'

export abstract class BaseLogServer {
  levelThresholdName = defaultLogLevel()

  abstract printLog: (ev: LogEvent) => void

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
    if (log.messageBuilder) {
      let out = log.messageBuilder()
      if (Array.isArray(out)) {
        log.args = out
      } else {
        log.args = [out]
      }
    }

    this.printLog(log)
  }
}
