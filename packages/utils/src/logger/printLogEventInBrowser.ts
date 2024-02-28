import type { LogEvent } from './Logger.js'
import { LogLevelName } from './helpers.js'

const levelMap: Record<LogLevelName, keyof typeof console> = {
  trace: 'log',
  debug: 'log',
  info: 'log',
  dev: 'info',
  error: 'error',
  warn: 'warn',
}

export const printLogEventInBrowser = (log: LogEvent) => {
  let key = levelMap[log.levelName] ?? 'log'
  console[key].call(console, ...log.args.slice(0, 2))
}
