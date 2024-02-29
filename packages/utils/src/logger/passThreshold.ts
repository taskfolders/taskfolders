import { levelNumbers, type LogLevelName } from './helpers.js'

export function passThreshold(kv: {
  level: LogLevelName
  threshold: LogLevelName
}) {
  let level_given = levelNumbers[kv.level]
  let level_threshold = levelNumbers[kv.threshold]
  let isPass = level_given >= level_threshold
  // if (isReleaseMode() && levelName === 'dev') {
  //   isPass = false
  // }
  return isPass
}
