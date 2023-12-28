import { LogServer } from './LogServer'
import { LogLevelName } from './helpers'

type LogArgs = [message: string | Object] | [message: any, obj: any]

function createLogLevelFunction(level: LogLevelName) {
  return function (this: Logger, ...args: LogArgs) {
    this.logRaw({ args, levelName: level })
  }
}

export interface LogEvent {
  message?: string
  args?: LogArgs
  levelName?: LogLevelName
}

export class Logger {
  server = LogServer.request()

  constructor() {}

  logRaw(kv: LogEvent) {
    this.server.handleLog(kv)
  }

  trace = createLogLevelFunction('trace')
  debug = createLogLevelFunction('debug')
  info = createLogLevelFunction('info')
  dev = createLogLevelFunction('dev')
  warn = createLogLevelFunction('warn')
  error = createLogLevelFunction('error')
}
