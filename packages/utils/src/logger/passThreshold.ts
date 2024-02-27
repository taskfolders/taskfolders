import { levelNumbers, LogLevelName } from './helpers'

export function passThreshold(kv: {
  level: LogLevelName
  threshold: LogLevelName
}) {
  let level_given = levelNumbers[kv.level]
  if (level_given === undefined) return false
  let level_threshold = levelNumbers[kv.threshold]
  if (level_threshold === undefined) return false
  let isPass = level_given >= level_threshold
  return isPass
}
